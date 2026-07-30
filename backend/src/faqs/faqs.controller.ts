import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}
  @Get() findAll() { return this.faqsService.findAll(); }
}

@ApiTags('Admin - FAQs')
@ApiBearerAuth()
@Controller('admin/faqs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminFaqsController {
  constructor(private readonly faqsService: FaqsService) {}
  @Get() findAll() { return this.faqsService.findAllAdmin(); }
  @Post() @HttpCode(HttpStatus.CREATED) create(@Body() dto: CreateFaqDto) { return this.faqsService.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateFaqDto) { return this.faqsService.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id') id: string) { return this.faqsService.remove(id); }
}
