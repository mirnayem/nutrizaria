import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CouponType } from '@prisma/client';

// Convert a datetime string into a full ISO-8601 DateTime that Prisma can
// store. Nulls and empty strings pass through untouched.
const toIsoDateTime = ({ value }: { value: unknown }) => {
  if (value == null || value === '') return value as string | undefined;
  const d = new Date(value as string);
  const iso = d.toISOString();
  return Number.isNaN(d.getTime()) ? (value as string) : iso;
};

export class CreateCouponDto {
  @ApiProperty({ description: 'Promo code. Stored/compared in uppercase.' })
  @IsString()
  code: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ description: 'Discount value: fixed amount (BDT) or percent (e.g. 10 = 10%).' })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Minimum cart subtotal required to use the coupon.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional({ description: 'ISO datetime the coupon becomes valid.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  validFrom?: string;

  @ApiPropertyOptional({ description: 'ISO datetime the coupon expires.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Maximum number of redemptions (unlimited when empty).' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: CouponType })
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ description: 'Coupon code to validate.' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Current cart subtotal used to compute the discount.' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}