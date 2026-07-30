import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    const secret = config.get('STRIPE_SECRET_KEY');
    if (secret && !secret.startsWith('sk_test_placeholder')) {
      this.stripe = new Stripe(secret, { apiVersion: '2024-09-30.acacia' as any });
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const currency = dto.currency || this.config.get('CHECKOUT_CURRENCY', 'usd') || 'usd';
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount),
      currency,
      description: 'NutriZaria order',
      receipt_email: dto.email,
      metadata: { platform: 'nutrizaria' },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      status: intent.status,
    };
  }

  async handleWebhook(body: Buffer, signature: string) {
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
}
