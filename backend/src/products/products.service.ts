import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto, CreateProductVariantDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'newest',
      featured,
      minPrice,
      maxPrice,
    } = query;

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
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

  async findAllAdmin(query: QueryProductDto) {
    const { page = 1, limit = 20, category, search, sort = 'newest' } = query;

    const where: any = {};
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'name': orderBy.name = 'asc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true, variants: { orderBy: { sortOrder: 'asc' } } },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { category: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      take: 20,
    });
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) throw new NotFoundException('Category not found');

    const slug = await this.generateUniqueSlug(
      dto.slug?.trim() || this.slugify(dto.name),
    );

    const { variants, categorySlug, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        categoryId: category.id,
        variants: variants?.length ? {
          create: variants.map((v, index) => ({
            ...v,
            sortOrder: v.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: { category: true, variants: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const data: any = { ...dto };
    const { variants, categorySlug, ...restData } = data;
    Object.assign(data, restData);
    delete data.slug;
    delete data.variants;
    delete data.categorySlug;

    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (!category) throw new NotFoundException('Category not found');
      data.categoryId = category.id;
    }
    if (dto.slug && dto.slug.trim()) {
      data.slug = await this.generateUniqueSlug(dto.slug.trim(), id);
    } else if (dto.name && dto.name !== product.name) {
      data.slug = await this.generateUniqueSlug(this.slugify(dto.name), id);
    }

    // Handle variants
    if (variants && variants.length > 0) {
      // Delete existing variants and recreate
      await this.prisma.productVariant.deleteMany({ where: { productId: id } });
      data.variants = {
        create: variants.map((v, index) => ({
          ...v,
          sortOrder: v.sortOrder ?? index,
        })),
      };
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, variants: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
  }

  private slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'product'
    );
  }

  private async generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const candidate = this.slugify(base);
    let slug = candidate;
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${candidate}-${suffix}`;
      suffix += 1;
    }
  }
}
