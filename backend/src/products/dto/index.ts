import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min, ValidateNested, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// Convert a datetime string (e.g. "2026-08-08T06:37") plus any valid input
// into a full ISO-8601 DateTime that Prisma can store. Nulls pass through.
const toIsoDateTime = ({ value }: { value: unknown }) => {
  if (value == null || value === '') return value as string | undefined;
  const d = new Date(value as string);
  const iso = d.toISOString();
  return Number.isNaN(d.getTime()) ? (value as string) : iso;
};

export class CreateProductVariantDto {
  @ApiPropertyOptional({
    description: 'Optional display label. When omitted, the storefront shows weight + unit.',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Sale price for this variant (optional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Sale price for this variant (optional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug. Auto-generated from name when omitted.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Required for non-variant products; auto-derived from the cheapest variant for variant products.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Sale price (optional). When set with valid dates, the product appears in the sale section.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Weight of the product, e.g. 250 for "250g" combined with unit "g".' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Sale start date-time (ISO 8601). Product is on sale from this moment.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  saleStartAt?: string;

  @ApiPropertyOptional({ description: 'Sale end date-time (ISO 8601). Product stops being on sale after this moment.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  saleEndAt?: string;

  @ApiPropertyOptional({
    description: 'Required for non-variant products; auto-derived from variants for variant products.',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Required for non-variant products; auto-derived from variants for variant products.',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ description: 'Brand slug (optional).' })
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiProperty()
  @IsString()
  categorySlug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug. Auto-generated from name when omitted.',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Sale price (optional). When set with valid dates, the product appears in the sale section.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Weight of the product, e.g. 250 for "250g" combined with unit "g".' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Sale start date-time (ISO 8601). Product is on sale from this moment.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  saleStartAt?: string;

  @ApiPropertyOptional({ description: 'Sale end date-time (ISO 8601). Product stops being on sale after this moment.' })
  @IsOptional()
  @IsDateString()
  @Transform(toIsoDateTime)
  saleEndAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ description: 'Brand slug (optional).' })
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}

export class QueryProductDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Cursor for cursor-based pagination (takes precedence over page)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['price_asc', 'price_desc', 'newest', 'name'] })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featured?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maxPrice?: string;

  @ApiPropertyOptional({ description: 'Filter products currently on sale (true/false)' })
  @IsOptional()
  @IsString()
  sale?: string;
}
