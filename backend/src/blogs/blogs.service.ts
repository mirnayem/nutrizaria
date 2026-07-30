import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
    return post;
  }

  async create(dto: CreateBlogDto) {
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        slug: this.generateSlug(dto.title),
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    const data: any = { ...dto };
    if (dto.title) data.slug = this.generateSlug(dto.title);
    if (dto.isPublished && !post.publishedAt) data.publishedAt = new Date();
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') + '-' + Date.now().toString(36);
  }
}
