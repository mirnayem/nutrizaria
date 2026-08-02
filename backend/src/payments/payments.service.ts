import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateSslcommerzOrderDto } from './dto';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus } from '@prisma/client';

interface SslcommerzConfig {
  storeId: string;
  storePass: string;
  sandbox: boolean;
}

interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  sandbox: boolean;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private bkashToken: { value: string; expiresAt: number } | null = null;

  constructor(
    private config: ConfigService,
    private ordersService: OrdersService,
  ) {
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

  private sslConfig(): SslcommerzConfig | null {
    const storeId = this.config.get('SSLCOMMERZ_STORE_ID');
    const storePass = this.config.get('SSLCOMMERZ_STORE_PASS');
    const sandbox = this.config.get('SSLCOMMERZ_SANDBOX') !== 'false';
    if (storeId && !storeId.startsWith('sslcommerz_placeholder') && storePass) {
      return { storeId, storePass, sandbox };
    }
    return null;
  }

  private sslSessionUrl(sandbox: boolean) {
    return sandbox
      ? 'https://sandbox.sslcommerz.com/gateprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gateprocess/v4/api.php';
  }

  private sslValidatorUrl(sandbox: boolean) {
    return sandbox
      ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';
  }

  private baseUrl(): string {
    return (this.config.get('BACKEND_URL') || 'http://localhost:4000').replace(/\/$/, '');
  }

  frontendUrl(): string {
    return (this.config.get('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
  }

  private sslCbUrls() {
    return {
      success: `${this.baseUrl()}/api/payments/sslcommerz/success`,
      fail: `${this.baseUrl()}/api/payments/sslcommerz/fail`,
      cancel: `${this.baseUrl()}/api/payments/sslcommerz/cancel`,
      notify: `${this.baseUrl()}/api/payments/sslcommerz/notify`,
    };
  }

  private bkashCallbackBase(): string {
    return `${this.baseUrl()}/api/payments/bkash/callback`;
  }

  /**
   * Creates a pending order and obtains a hosted SSLCommerz gateway URL.
   */
  async initiateSslcommerz(userId: string, dto: CreateSslcommerzOrderDto) {
    const ssl = this.sslConfig();
    if (!ssl) throw new BadRequestException('SSLCOMMERZ is not configured');

    const order = await this.ordersService.create(userId, {
      shippingName: dto.shippingName,
      shippingEmail: dto.shippingEmail,
      shippingPhone: dto.shippingPhone,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingCountry: dto.shippingCountry,
      deliveryArea: dto.deliveryArea,
      paymentMethod: 'SSLCOMMERZ',
      items: dto.items,
    });

    const cb = this.sslCbUrls();
    const params = new URLSearchParams({
      store_id: ssl.storeId,
      store_passwd: ssl.storePass,
      total_amount: order.total.toFixed(2),
      currency: this.config.get('CHECKOUT_CURRENCY', 'BDT') || 'BDT',
      tran_id: order.orderNumber,
      success_url: cb.success,
      fail_url: cb.fail,
      cancel_url: cb.cancel,
      notify_url: cb.notify,
      cus_name: dto.shippingName,
      cus_email: dto.shippingEmail || '',
      cus_phone: dto.shippingPhone,
      cus_add1: dto.shippingAddress,
      cus_city: dto.shippingCity || 'Dhaka',
      cus_country: dto.shippingCountry || 'Bangladesh',
      shipping_method: 'NO',
      num_of_item: String(dto.items.reduce((acc, i) => acc + i.quantity, 0)),
      product_name: `Order ${order.orderNumber}`,
      product_profile: 'non-physical-goods',
      product_amount: order.subtotal.toFixed(2),
    });

    const gateway = await fetch(this.sslSessionUrl(ssl.sandbox), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const result: any = await gateway.json();
    if (result.status !== 'SUCCESS' || !result.GatewayPageURL) {
      await this.ordersService.updatePaymentStatus(order.id, {
        status: PaymentStatus.FAILED,
        paymentRef: order.orderNumber,
      });
      throw new BadRequestException(
        result.failedreason || 'Unable to initiate SSLCommerz payment. Please try again.',
      );
    }

    return { orderId: order.id, orderNumber: order.orderNumber, gatewayUrl: result.GatewayPageURL };
  }

  /**
   * Parses the query params returned by the SSLCommerz gateway and, when the
   * payment was successful, validates the transaction and marks the order PAID.
   */
  async handleSslReturn(query: Record<string, any>) {
    const status = String(query.status || query.status_value || '').toLowerCase();
    const isValid = status === 'valid' || query.val_id;

    if (isValid && query.val_id) {
      await this.verifySslcommerzPayment(query);
    }

    return {
      orderNumber: query.tran_id,
      gateway: status,
      token: query.val_id,
    };
  }

  /**
   * Handler for the gateway IPN notification. Confirms the transaction and
   * updates the order to PAID when valid.
   */
  async handleSslIpn(body: Record<string, any>) {
    const valid = String(body.verify_sign || '').toLowerCase() !== 'failed';
    if (!valid) {
      return { received: true, processed: false };
    }

    if (body.tran_id && body.val_id) {
      await this.verifySslcommerzPayment(body);
    }

    return { received: true, processed: true };
  }

  private async verifySslcommerzPayment(params: Record<string, any>) {
    const ssl = this.sslConfig();
    if (!ssl) return;

    const validator = await fetch(
      `${this.sslValidatorUrl(ssl.sandbox)}?val_id=${encodeURIComponent(
        params.val_id,
      )}&store_id=${encodeURIComponent(ssl.storeId)}&store_passwd=${encodeURIComponent(
        ssl.storePass,
      )}&format=json`,
      { method: 'GET' },
    );
    const tx: any = await validator.json();

    const paid = tx.status === 'VALID' || tx.status === 'VALIDATED';
    if (!paid) return;

    const orderNumber = params.tran_id || params.orderNumber;
    if (!orderNumber) return;

    try {
      const order = await this.ordersService.findByOrderNumber(orderNumber);
      if (order.paymentStatus === PaymentStatus.PAID) return;
      await this.ordersService.updatePaymentStatus(order.id, {
        status: PaymentStatus.PAID,
        paymentRef: params.val_id || params.transaction_id || orderNumber,
      });
    } catch (e) {
      if (e instanceof NotFoundException) return;
      throw e;
    }
  }

  private bkashConfig(): BkashConfig | null {
    const appKey = this.config.get('BKASH_APP_KEY');
    const appSecret = this.config.get('BKASH_APP_SECRET');
    const username = this.config.get('BKASH_USERNAME');
    const password = this.config.get('BKASH_PASSWORD');
    const sandbox = this.config.get('BKASH_SANDBOX') !== 'false';
    if (
      appKey &&
      appSecret &&
      username &&
      password &&
      !appKey.startsWith('bkash_placeholder')
    ) {
      return { appKey, appSecret, username, password, sandbox };
    }
    return null;
  }

  private bkashBaseUrl(sandbox: boolean) {
    return sandbox
      ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
  }

  private async grantBkashToken(): Promise<string> {
    const b = this.bkashConfig();
    if (!b) throw new BadRequestException('bKash is not configured');

    if (this.bkashToken && this.bkashToken.expiresAt > Date.now()) {
      return this.bkashToken.value;
    }

    const res = await fetch(`${this.bkashBaseUrl(b.sandbox)}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: b.username,
        password: b.password,
      },
      body: JSON.stringify({ app_key: b.appKey, app_secret: b.appSecret }),
    });

    const result: any = await res.json();
    if (!result.id_token) {
      throw new BadRequestException(result.statusMessage || 'Unable to obtain bKash token.');
    }

    const expiresIn = Number(result.expires_in || 3600) * 1000;
    this.bkashToken = { value: result.id_token, expiresAt: Date.now() + expiresIn - 30000 };
    return result.id_token;
  }

  private bkashHeaders(token: string) {
    const b = this.bkashConfig()!;
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-App-Key': b.appKey,
    };
  }

  /**
   * Creates a pending order and a hosted bKash (Tokenized Checkout) payment,
   * returning the gateway URL the customer should be redirected to.
   */
  async initiateBkash(userId: string, dto: CreateSslcommerzOrderDto) {
    const b = this.bkashConfig();
    if (!b) throw new BadRequestException('bKash is not configured');

    const order = await this.ordersService.create(userId, {
      shippingName: dto.shippingName,
      shippingEmail: dto.shippingEmail,
      shippingPhone: dto.shippingPhone,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingCountry: dto.shippingCountry,
      deliveryArea: dto.deliveryArea,
      paymentMethod: 'BKASH',
      items: dto.items,
    });

    const token = await this.grantBkashToken();
    const callback = this.bkashCallbackBase();
    const payload = {
      mode: '0011',
      payerReference: dto.shippingPhone || dto.shippingName,
      callbackURL: callback,
      amount: order.total.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: order.orderNumber,
    };

    const resResp = await fetch(`${this.bkashBaseUrl(b.sandbox)}/tokenized/checkout/create`, {
      method: 'POST',
      headers: this.bkashHeaders(token),
      body: JSON.stringify(payload),
    });
    const result: any = await resResp.json();

    if (!result.paymentID || !result.bkashURL) {
      await this.ordersService.updatePaymentStatus(order.id, {
        status: PaymentStatus.FAILED,
        paymentRef: order.orderNumber,
      });
      throw new BadRequestException(
        result.statusMessage || 'Unable to initiate bKash payment. Please try again.',
      );
    }

    // Persist the gateway payment ID so the callback can resolve this order.
    await this.ordersService.storeGatewayPaymentId(order.id, result.paymentID);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      gatewayUrl: result.bkashURL,
      paymentID: result.paymentID,
    };
  }

  /**
   * Validates an executed bKash transaction on the callback from the gateway
   * and marks the order PAID when the payment completed successfully.
   */
  async handleBkashCallback(query: Record<string, any>) {
    const b = this.bkashConfig();
    if (!b) return { processed: false };

    const paymentID = query.paymentID || query.payment_id;
    const status = String(query.status || '').toLowerCase();
    if (!paymentID) {
      return {
        processed: false,
        status: status || 'unknown',
        orderNumber: query.merchantInvoiceNumber,
      };
    }

    const token = await this.grantBkashToken();
    const execRes = await fetch(
      `${this.bkashBaseUrl(b.sandbox)}/tokenized/checkout/execute`,
      {
        method: 'POST',
        headers: this.bkashHeaders(token),
        body: JSON.stringify({ paymentID }),
      },
    );
    const executed: any = await execRes.json();

    const isComplete = executed.transactionStatus === 'Completed' && executed.trxID;
    if (!isComplete) {
      return {
        processed: false,
        status: 'failed',
        paymentID,
        merchantInvoiceNumber: executed.merchantInvoiceNumber,
      };
    }

    try {
      const order = await this.ordersService.findByGatewayPaymentId(paymentID);
      if (order.paymentStatus === PaymentStatus.PAID) {
        return { processed: true, status: 'success', orderNumber: order.orderNumber, trxID: executed.trxID };
      }
      await this.ordersService.updatePaymentStatus(order.id, {
        status: PaymentStatus.PAID,
        paymentRef: executed.trxID,
      });
      return { processed: true, status: 'success', orderNumber: order.orderNumber, trxID: executed.trxID };
    } catch (e) {
      if (e instanceof NotFoundException) {
        return { processed: false, status: 'not_found', paymentID };
      }
      throw e;
    }
  }
}