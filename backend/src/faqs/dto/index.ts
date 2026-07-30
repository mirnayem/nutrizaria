import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty() @IsString() question: string;
  @ApiProperty() @IsString() answer: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateFaqDto {
  @ApiPropertyOptional() @IsOptional() @IsString() question?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() answer?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
