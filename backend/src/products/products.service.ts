import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto, CreateProductVariantDto } from './dto';
import { parsePagination, buildPaginationResult } from '../common/pagination';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
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

    if (brand) {
      where.brand = { slug: brand };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
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
        include: { category: true, brand: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
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
    const { category, brand, search, sort = 'newest' } = query;
    const pagination = parsePagination(query, 20);

    const where: any = {};
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'name': orderBy.name = 'asc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const findManyArgs: any = {
      where,
      include: { category: true, brand: true, variants: { orderBy: { sortOrder: 'asc' } } },
      orderBy,
      take: pagination.take,
    };

    if (pagination.mode === 'cursor') {
      findManyArgs.cursor = { id: pagination.cursor };
      findManyArgs.skip = 1;
    } else {
      findManyArgs.skip = pagination.skip;
    }

    const count = await this.prisma.product.count({ where });

    const rawItems = await this.prisma.product.findMany(findManyArgs);

    return buildPaginationResult(rawItems, pagination, count);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true, brand: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, variants: { orderBy: { sortOrder: 'asc' } } },
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
          { brand: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { category: true, brand: true, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      take: 20,
    });
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) throw new NotFoundException('Category not found');

    let brandId: string | undefined;
    if (dto.brandSlug) {
      const brand = await this.prisma.brand.findUnique({
        where: { slug: dto.brandSlug },
      });
      if (!brand) throw new NotFoundException('Brand not found');
      brandId = brand.id;
    }

    const slug = await this.generateUniqueSlug(
      dto.slug?.trim() || this.slugify(dto.name),
    );

    const { variants, categorySlug, brandSlug, ...productData } = dto;

    const base = this.resolveBaseFields(productData, variants, null);

    return this.prisma.product.create({
      data: {
        ...productData,
        ...base,
        slug,
        categoryId: category.id,
        brandId,
        variants: variants?.length ? {
          create: variants.map((v, index) => ({
            ...v,
            sortOrder: v.sortOrder ?? index,
          })),
        } : undefined,
      },
      include: { category: true, brand: true, variants: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const data: any = { ...dto };
    const { variants, categorySlug, brandSlug, ...restData } = data;
    Object.assign(data, restData);
    delete data.slug;
    delete data.variants;
    delete data.categorySlug;
    delete data.brandSlug;

    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (!category) throw new NotFoundException('Category not found');
      data.categoryId = category.id;
    }

    if (brandSlug !== undefined) {
      if (brandSlug === null || brandSlug === '') {
        data.brandId = null;
      } else {
        const brand = await this.prisma.brand.findUnique({
          where: { slug: brandSlug },
        });
        if (!brand) throw new NotFoundException('Brand not found');
        data.brandId = brand.id;
      }
    }
    if (dto.slug && dto.slug.trim()) {
      data.slug = await this.generateUniqueSlug(dto.slug.trim(), id);
    } else if (dto.name && dto.name !== product.name) {
      data.slug = await this.generateUniqueSlug(this.slugify(dto.name), id);
    }

    // Handle variants: an explicit array replaces all existing variants
    // (an empty array removes them entirely).
    if (Array.isArray(variants)) {
      await this.prisma.productVariant.deleteMany({ where: { productId: id } });
      data.variants = {
        create: variants.map((v, index) => ({
          ...v,
          sortOrder: v.sortOrder ?? index,
        })),
      };
    }

    // Ensure display fields (price/unit/image/stock) are always populated.
    const base = this.resolveBaseFields(restData, variants, product);
    Object.assign(data, base);

    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, brand: true, variants: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  /**
   * Resolves the product-level display fields. For variant products these are
   * derived from the variants (cheapest price, its unit, first variant image,
   * total stock) so storefront cards keep working. Explicit values win.
   */
  private resolveBaseFields(
    input: any,
    variants: any[] | undefined,
    existing: {
      price: number;
      unit: string;
      image: string;
      images: string[];
      stock: number;
    } | null,
  ): { price: number; unit: string; image: string; images: string[]; stock: number } {
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    const activeVariants = hasVariants ? variants.filter((v) => v.isActive !== false) : [];

    const has = (val: any) => val !== undefined && val !== null && val !== '';

    const base = {
      price: existing?.price ?? 0,
      unit: existing?.unit ?? '',
      image: existing?.image ?? '',
      images: existing?.images ?? [],
      stock: existing?.stock ?? 0,
    };

    if (has(input.price)) base.price = input.price;
    if (has(input.unit)) base.unit = input.unit;
    if (has(input.image)) base.image = input.image;
    if (Array.isArray(input.images) && input.images.length > 0) base.images = input.images;
    if (has(input.stock)) base.stock = input.stock;

    if (hasVariants) {
      const sorted = [...activeVariants].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      const cheapest = sorted[0] || variants[0];
      if (cheapest) {
        if (!has(input.price)) base.price = cheapest.price;
        if (!has(input.unit)) base.unit = cheapest.unit;
        if (!has(input.stock)) {
          base.stock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
        }
      }
      const variantImg = variants.map((v) => v.image).find(Boolean);
      if (variantImg && !has(input.image)) base.image = variantImg;
      const variantImgs = variants.map((v) => v.image).filter(Boolean);
      if (variantImgs.length && !(Array.isArray(input.images) && input.images.length > 0)) {
        base.images = variantImgs;
      }
    } else if (!existing || (Array.isArray(variants) && variants.length === 0)) {
      // Non-variant product (new, or variants being removed): base fields required.
      if (!has(input.price) && !base.price) {
        throw new BadRequestException('Price is required for a non-variant product');
      }
      if (!has(input.unit) && !base.unit) {
        throw new BadRequestException('Unit is required for a non-variant product');
      }
      if (!has(input.image) && !base.image) {
        throw new BadRequestException('Image is required for a non-variant product');
      }
    }

    return base;
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
