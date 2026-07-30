import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsString() author: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateBlogDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() image?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() author?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}
