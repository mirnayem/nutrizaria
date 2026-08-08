import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  /**
   * Computes the absolute discount (BDT) a coupon grants for a given subtotal.
   * Fixed coupons discount min(value, subtotal); percentage coupons discount
   * a capped percentage of the subtotal, never exceeding the subtotal.
   */
  computeDiscount(coupon: any, subtotal: number): number {
    let discount =
      coupon.type === 'PERCENTAGE'
        ? (subtotal * coupon.value) / 100
        : coupon.type === 'FIXED'
          ? coupon.value
          : 0;
    discount = Math.min(discount, subtotal);
    return Math.round(discount * 100) / 100;
  }

  /**
   * Loads a coupon by code and throws a friendly error when it cannot be used.
   * Returns the coupon record when it is valid.
   */
  async validateOrThrow(code: string, subtotal: number): Promise<any> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: this.normalizeCode(code) },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid coupon code');
    }
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new BadRequestException('This coupon is not active yet');
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new BadRequestException('This coupon has expired');
    }
    if (
      coupon.maxUses != null &&
      coupon.usageCount >= coupon.maxUses
    ) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (subtotal <= 0) {
      throw new BadRequestException('Your cart is empty');
    }
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      throw new BadRequestException(
        `Minimum order subtotal for this coupon is ${coupon.minSubtotal}. Add more items to apply it.`,
      );
    }

    return coupon;
  }

  async validate(code: string, subtotal: number) {
    const coupon = await this.validateOrThrow(code, subtotal);
    const discount = this.computeDiscount(coupon, subtotal);
    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      discount,
      subtotal: Math.round(subtotal * 100) / 100,
      totalAfterDiscount: Math.round((subtotal - discount) * 100) / 100,
    };
  }

  async findAll(params: { search?: string } = {}) {
    const where: any = {};
    if (params.search) {
      where.OR = [{ code: { contains: params.search, mode: 'insensitive' } }];
    }
    return this.prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = this.normalizeCode(dto.code);
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('A coupon with this code already exists');
    return this.prisma.coupon.create({ data: { ...dto, code } });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const data: any = { ...dto };
    if (dto.code) {
      const code = this.normalizeCode(dto.code);
      const existing = await this.prisma.coupon.findFirst({
        where: { code, id: { not: id } },
      });
      if (existing) throw new BadRequestException('A coupon with this code already exists');
      data.code = code;
    }
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.prisma.coupon.delete({ where: { id } });
  }
}