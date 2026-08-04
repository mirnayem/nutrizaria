import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
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

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
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
