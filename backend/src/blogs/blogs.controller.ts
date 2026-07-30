import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @Get() findAll() { return this.blogsService.findAll(); }
  @Get(':slug') findBySlug(@Param('slug') slug: string) { return this.blogsService.findBySlug(slug); }
}

@ApiTags('Admin - Blogs')
@ApiBearerAuth()
@Controller('admin/blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminBlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @Get() findAll() { return this.blogsService.findAllAdmin(); }
  @Post() @HttpCode(HttpStatus.CREATED) create(@Body() dto: CreateBlogDto) { return this.blogsService.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateBlogDto) { return this.blogsService.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id') id: string) { return this.blogsService.remove(id); }
}
