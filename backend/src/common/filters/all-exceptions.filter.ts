import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.isDev = (config.get('NODE_ENV') || 'development') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const payload: any = {
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message || message,
      timestamp: new Date().toISOString(),
    };

    if (this.isDev && !(exception instanceof HttpException)) {
      console.error(exception);
      payload.detail =
        exception instanceof Error ? exception.message : String(exception);
    }

    response.status(status).json(payload);
  }
}
