import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderItemDto } from '../../orders/dto';

export class CreatePaymentIntentDto {
  @ApiProperty() @IsNumber() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
}

export class CreateSslcommerzOrderDto {
  @ApiProperty()
  @IsString()
  shippingName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingEmail?: string;

  @ApiProperty()
  @IsString()
  shippingPhone: string;

  @ApiProperty()
  @IsString()
  shippingAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingCountry?: string;

  @ApiPropertyOptional({ enum: ['inside', 'outside'], default: 'inside' })
  @IsOptional()
  @IsString()
  deliveryArea?: string;

  @ApiPropertyOptional({ description: 'Coupon/promo code to apply to this order.' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}