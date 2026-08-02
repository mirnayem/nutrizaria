import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, CreateSslcommerzOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<any>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.paymentsService.handleWebhook(req.rawBody!, signature);
    return { received: true, type: event.type };
  }

  @Post('sslcommerz/init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  initiateSslcommerz(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSslcommerzOrderDto,
  ) {
    return this.paymentsService.initiateSslcommerz(userId, dto);
  }

  @Post('bkash/init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  initiateBkash(@CurrentUser('id') userId: string, @Body() dto: CreateSslcommerzOrderDto) {
    return this.paymentsService.initiateBkash(userId, dto);
  }

  @Get('bkash/callback')
  async bkashCallback(@Query() query: any, @Res() res: Response) {
    const result = await this.paymentsService.handleBkashCallback(query || {});
    const frontend = this.paymentsService.frontendUrl();
    const status = result.processed ? 'success' : 'failed';
    const order = result.orderNumber || '';
    return res.redirect(
      `${frontend}/checkout?payment=bkash&status=${status}&order=${encodeURIComponent(order)}`,
    );
  }

  @Post('sslcommerz/notify')
  @HttpCode(HttpStatus.OK)
  async sslNotify(@Body() body: any) {
    return this.paymentsService.handleSslIpn(body || {});
  }

  @Get('sslcommerz/success')
  @Post('sslcommerz/success')
  @HttpCode(HttpStatus.FOUND)
  async sslSuccess(@Body() body: any, @Query() query: any, @Res() res: Response) {
    const result = await this.paymentsService.handleSslReturn({ ...query, ...(body || {}) });
    const frontend = this.paymentsService.frontendUrl();
    const order = result.orderNumber;
    return res.redirect(
      `${frontend}/checkout?payment=sslcommerz&status=success&order=${encodeURIComponent(order || '')}`,
    );
  }

  @Get('sslcommerz/fail')
  @Post('sslcommerz/fail')
  @HttpCode(HttpStatus.FOUND)
  async sslFail(@Body() body: any, @Query() query: any, @Res() res: Response) {
    await this.paymentsService.handleSslReturn({ ...query, ...(body || {}) });
    const frontend = this.paymentsService.frontendUrl();
    return res.redirect(`${frontend}/checkout?payment=sslcommerz&status=failed`);
  }

  @Get('sslcommerz/cancel')
  @Post('sslcommerz/cancel')
  @HttpCode(HttpStatus.FOUND)
  async sslCancel(@Body() body: any, @Query() query: any, @Res() res: Response) {
    await this.paymentsService.handleSslReturn({ ...query, ...(body || {}) });
    const frontend = this.paymentsService.frontendUrl();
    return res.redirect(`${frontend}/checkout?payment=sslcommerz&status=cancelled`);
  }
}