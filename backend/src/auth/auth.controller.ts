import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  GoogleLoginDto,
  PhoneLoginDto,
  CompleteProfileDto,
  CheckPhoneDto,
  PhonePasswordLoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  SetPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.token);
  }

  @Post('phone')
  @HttpCode(HttpStatus.OK)
  phoneLogin(@Body() dto: PhoneLoginDto) {
    return this.authService.phoneLogin(dto.token);
  }

  @Post('check-phone')
  @HttpCode(HttpStatus.OK)
  checkPhone(@Body() dto: CheckPhoneDto) {
    return this.authService.checkPhone(dto);
  }

  @Post('phone-password')
  @HttpCode(HttpStatus.OK)
  phonePasswordLogin(@Body() dto: PhonePasswordLoginDto) {
    return this.authService.phonePasswordLogin(dto);
  }

  @Post('complete-profile')
  @HttpCode(HttpStatus.OK)
  completeProfile(@Body() dto: CompleteProfileDto) {
    return this.authService.completeProfile(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(userId, dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  setPassword(@CurrentUser('id') userId: string, @Body() dto: SetPasswordDto) {
    return this.authService.setPassword(userId, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAddresses(@CurrentUser('id') userId: string) {
    return this.authService.findAddresses(userId);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  createAddress(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.authService.createAddress(userId, dto);
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.authService.updateAddress(userId, id, dto);
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  removeAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.authService.removeAddress(userId, id);
  }
}
