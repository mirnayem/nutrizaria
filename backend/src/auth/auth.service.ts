import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
  CompleteProfileDto,
  CheckPhoneDto,
  PhonePasswordLoginDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');
    if (!user.password)
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  async googleLogin(token: string) {
    const claims = await this.verifyGoogleToken(token);
    if (!claims || !claims.email)
      throw new UnauthorizedException('Invalid Google token');

    const email = claims.email;
    const googleId = claims.sub;

    const payloadUser = {
      name: claims.name ?? undefined,
      avatar: claims.picture ?? undefined,
    };

    // 1) Link by googleId (stable account identity)
    let user = googleId
      ? await this.prisma.user.findUnique({ where: { googleId } })
      : null;

    // 2) Link by email so an existing email/password account becomes the same account
    if (!user) {
      user = email
        ? await this.prisma.user.findUnique({ where: { email } })
        : null;
    }

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(payloadUser.name && { name: payloadUser.name }),
          ...(payloadUser.avatar && { avatar: payloadUser.avatar }),
          ...(googleId && user.googleId !== googleId && { googleId }),
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          name: payloadUser.name,
          avatar: payloadUser.avatar,
          emailVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    return this.generateTokens(user);
  }

  /**
   * Validates a Google OAuth access token (obtained via Google Identity
   * Services "token client") against Google's userinfo endpoint. No client
   * secret required server-side.
   */
  private async verifyGoogleToken(
    accessToken: string,
  ): Promise<Record<string, any> | null> {
    try {
      const res = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!res.ok) return null;
      const info: Record<string, any> = await res.json();
      if (info.error) return null;
      if (info.email_verified === false) return null;
      if (!info.email || !info.sub) return null;
      return info;
    } catch {
      return null;
    }
  }

  /**
   * Completes phone-number OTP sign-in. The OTP confirmation happens on the
   * client via Firebase Auth; here we verify the resulting Firebase ID token
   * with Firebase's REST API (using the web API key) and find-or-create the user.
   */
  async phoneLogin(token: string) {
    const apiKey = this.config.get<string>('FIREBASE_WEB_API_KEY');
    if (!apiKey)
      throw new UnauthorizedException('Phone sign-in is not configured');

    const identity = await this.lookupFirebaseUser(token, apiKey);
    if (!identity)
      throw new UnauthorizedException('Invalid or expired verification code');

    const uid = identity.localId;
    const phone = identity.phoneNumber || undefined;
    if (!uid) throw new UnauthorizedException('Invalid phone sign-in session');

    // Resolve by firebase uid first, then by phone so an existing account is reused.
    let user = uid
      ? await this.prisma.user.findUnique({ where: { firebaseUid: uid } })
      : null;
    if (!user && phone) {
      user = await this.prisma.user.findFirst({ where: { phone } });
    }

    const data: any = {
      firebaseUid: uid,
      ...(phone && { phone }),
      phoneVerified: true,
      lastLoginAt: new Date(),
    };
    if (identity.email && user && !user.email) {
      data.email = identity.email;
    }

    if (user) {
      user = await this.prisma.user.update({ where: { id: user.id }, data });
    } else {
      user = await this.prisma.user.create({
        data: {
          firebaseUid: uid,
          ...(phone && { phone }),
          phoneVerified: true,
          name: identity.displayName || null,
          lastLoginAt: new Date(),
        },
      });
    }

    // Check if user needs to complete profile setup (missing name or password)
    if (!user.name || !user.password) {
      const setupToken = this.generateSetupToken(user.id);
      return {
        requiresSetup: true,
        setupToken,
        phone: user.phone,
      };
    }

    return this.generateTokens(user);
  }

  /**
   * Completes user profile after phone authentication by setting name and password.
   */
  async completeProfile(dto: CompleteProfileDto) {
    let userId: string;
    try {
      const payload = this.jwt.verify(dto.setupToken);
      if (payload.type !== 'setup') {
        throw new UnauthorizedException('Invalid setup token');
      }
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired setup token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        password: hashedPassword,
      },
    });

    return this.generateTokens(updatedUser);
  }

  private generateSetupToken(userId: string) {
    const payload = { sub: userId, type: 'setup' };
    return this.jwt.sign(payload, { expiresIn: '15m' });
  }

  /**
   * Checks if a phone number exists in the database and has a password set.
   */
  async checkPhone(dto: CheckPhoneDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
      select: { id: true, password: true, name: true },
    });
    return {
      exists: !!user,
      hasPassword: !!user?.password,
      name: user?.name || null,
    };
  }

  /**
   * Login with phone number and password (for users who completed profile setup).
   */
  async phonePasswordLogin(dto: PhonePasswordLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });
    if (!user) throw new UnauthorizedException('Phone number not registered');
    if (!user.password)
      throw new UnauthorizedException('No password set for this account');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  /**
   * Validates a Firebase ID token against Firebase Auth's REST API and
   * returns the account's identity record (phone, uid, email, name).
   */
  private async lookupFirebaseUser(
    token: string,
    apiKey: string,
  ): Promise<Record<string, any> | null> {
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
          apiKey,
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        },
      );
      if (!res.ok) {
        const bodyText = await res.text();
        // Distinguish a bad/missing API key from a genuinely invalid token.
        if (/API key|API_KEY_INVALID|REASON_MISMATCH|referrer|key expired/i.test(bodyText)) {
          throw new UnauthorizedException(
            'Phone sign-in misconfigured: invalid Firebase web API key',
          );
        }
        console.error('[auth] Firebase lookup failed', res.status, bodyText);
        return null;
      }
      const body: any = await res.json();
      const user = body?.users?.[0];
      if (!user) return null;
      return {
        localId: user.localId,
        phoneNumber: user.phoneNumber,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
      };
    } catch (e: any) {
      // Surface a Firebase *configuration* problem instead of hiding it as a
      // generic expired-code message, so it's obvious the API key is wrong.
      if (
        e instanceof UnauthorizedException &&
        /misconfigured/.test(String(e.message))
      ) {
        throw e;
      }
      return null;
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        password: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return { ...rest, hasPassword: !!password };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.password)
      throw new BadRequestException(
        'This account uses Google sign-in and has no password set.',
      );

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: 'Password updated successfully' };
  }

  async setPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.password)
      throw new BadRequestException(
        'This account already has a password set. Use change password instead.',
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: 'Password set successfully' };
  }

  async forgotPassword(dto: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return the same message to avoid leaking which emails are registered.
    // Also skip accounts without a password (Google / phone-only users).
    if (!user || !user.password) {
      return {
        message:
          'If an account exists for that email, a password reset link has been sent.',
      };
    }

    const token = this.jwt.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '15m' },
    );
    const frontendUrl = (
      this.config.get('FRONTEND_URL', 'http://localhost:3000') || ''
    ).replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await this.mail.sendPasswordResetEmail(
      user.email!,
      user.name ?? null,
      resetUrl,
    );

    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    let payload: any;
    try {
      payload = this.jwt.verify(dto.token);
    } catch {
      throw new BadRequestException(
        'This reset link is invalid or has expired. Please request a new one.',
      );
    }

    if (!payload || payload.type !== 'reset' || !payload.sub) {
      throw new BadRequestException(
        'This reset link is invalid or has expired. Please request a new one.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return { message: 'Your password has been reset. You can now sign in.' };
  }

  async findAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const existing = await this.prisma.address.count({ where: { userId } });

    if (dto.isDefault || existing === 0) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        country: dto.country || 'Bangladesh',
        postalCode: dto.postalCode,
        isDefault: existing === 0 ? true : dto.isDefault ?? false,
      },
    });
  }

  async updateAddress(userId: string, id: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async removeAddress(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted successfully' };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
    });
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }
}
