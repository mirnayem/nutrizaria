import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  shippingName: string;

  @ApiProperty()
  @IsString()
  shippingEmail: string;

  @ApiProperty()
  @IsString()
  shippingPhone: string;

  @ApiProperty()
  @IsString()
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  shippingCity: string;

  @ApiPropertyOptional({ default: 'Bangladesh' })
  @IsOptional()
  @IsString()
  shippingCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingPostal?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class UpdatePaymentStatusDto {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentRef?: string;
}

export class QueryOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
