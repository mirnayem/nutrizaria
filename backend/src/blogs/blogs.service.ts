import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto, QueryBlogDto } from './dto';
import { parsePagination, buildPaginationResult } from '../common/pagination';

const slugify = (value: string): string =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBlogDto) {
    const { page = 1, limit = 50, search, category, sort = 'newest' } = query;

    const where: any = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy.publishedAt = 'asc';
        break;
      case 'popular':
        orderBy.views = 'desc';
        break;
      default:
        orderBy.publishedAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(query: QueryBlogDto) {
    const { search, category, sort = 'newest' } = query;
    const pagination = parsePagination(query, 50);

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const findManyArgs: any = { where, orderBy, take: pagination.take };
    if (pagination.mode === 'cursor') {
      findManyArgs.cursor = { id: pagination.cursor };
      findManyArgs.skip = 1;
    } else {
      findManyArgs.skip = pagination.skip;
    }

    const count = await this.prisma.blogPost.count({ where });
    const rawItems = await this.prisma.blogPost.findMany(findManyArgs);

    return buildPaginationResult(rawItems, pagination, count);
  }

  async findBySlug(slug: string) {
    const cleanSlug = slugify(slug);

    const post =
      (await this.prisma.blogPost.findUnique({ where: { slug } })) ||
      (await this.prisma.blogPost.findFirst({
        where: {
          isPublished: true,
          OR: [
            { title: { equals: slug.replace(/-/g, ' '), mode: 'insensitive' } },
            { slug: { startsWith: `${cleanSlug}-` } },
          ],
        },
      })) ||
      (await this.prisma.blogPost.findFirst({
        where: { isPublished: true, title: { contains: cleanSlug.replace(/-/g, ' ') } },
      }));

    if (!post) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  }

  async create(dto: CreateBlogDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        slug,
        publishedAt: dto.isPublished ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    const data: any = { ...dto };
    if (dto.title) data.slug = await this.generateUniqueSlug(dto.title, id);

    if (dto.isPublished === true && !post.publishedAt) {
      data.publishedAt = new Date();
    } else if (dto.isPublished === false) {
      data.publishedAt = null;
    }

    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'post';
    let candidate = base;
    let index = 1;

    while (true) {
      const existing = await this.prisma.blogPost.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!existing) return candidate;
      index += 1;
      candidate = `${base}-${index}`;
    }
  }
}
