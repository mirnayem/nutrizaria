import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get('SMTP_PORT', 587)),
        secure: this.config.get('SMTP_SECURE') === 'true',
        auth: this.config.get('SMTP_USER')
          ? {
              user: this.config.get('SMTP_USER') as string,
              pass: this.config.get('SMTP_PASS') as string,
            }
          : undefined,
      });
    }
  }

  private get from(): string {
    return this.config.get('MAIL_FROM', 'no-reply@nutrizaria.com');
  }

  async sendPasswordResetEmail(
    to: string,
    name: string | null,
    resetUrl: string,
  ) {
    const subject = 'Reset your NutriZaria password';
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed; margin: 0 0 16px;">NutriZaria</h2>
        <p style="color: #334155; line-height: 1.6;">Hi ${name || 'there'},</p>
        <p style="color: #334155; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one.
          This link expires in 15 minutes.
        </p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">
            Reset password
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email. Your password won't change unless you use the link above.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">The NutriZaria team</p>
      </div>
    `;

    return this.send({ to, subject, html });
  }

  async send(options: MailOptions) {
    const resendKey = this.config.get('RESEND_API_KEY');

    if (this.transporter) {
      return this.sendViaSmtp(options);
    }

    if (resendKey) {
      return this.sendViaResend(resendKey, options);
    }

    this.logger.warn(
      'No mail provider configured (SMTP_HOST or RESEND_API_KEY). Logging email to the console instead of sending.',
    );
    this.logger.log(
      `[DEV MAIL] To: ${options.to}\nSubject: ${options.subject}\n${options.html}`,
    );
    return {
      devMode: true,
      to: options.to,
      subject: options.subject,
    };
  }

  private async sendViaResend(apiKey: string, options: MailOptions) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    const body: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      this.logger.error(
        `Resend failed (${response.status}): ${JSON.stringify(body)}`,
      );
      throw new Error(
        body?.message || `Email delivery failed with status ${response.status}`,
      );
    }

    this.logger.log(`Email sent via Resend to ${options.to}: ${body?.id}`);
    return { sent: true, messageId: body?.id };
  }

  private async sendViaSmtp(options: MailOptions) {
    const info = await this.transporter!.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  }
}