import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto, QueryOrderDto } from './dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { parsePagination, buildPaginationResult } from '../common/pagination';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

  private async getSetting(key: string, fallback: number): Promise<number> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    const val = Number(row?.value);
    return Number.isFinite(val) ? val : fallback;
  }

  /**
   * Resolves the effective selling price for an order line, applying the
   * sale price when it is set and currently active (within start/end window).
   * Mirrors the storefront logic so checkout totals match what the customer saw.
   */
  private resolvePrice(product: any, price: number, salePrice: number | null | undefined): number {
    const sale = salePrice ?? null;
    if (sale != null && sale > 0 && sale < price) {
      const now = new Date();
      if (product.saleStartAt && new Date(product.saleStartAt) > now) return price;
      if (product.saleEndAt && new Date(product.saleEndAt) < now) return price;
      return sale;
    }
    return price;
  }

  async computeShippingCost(deliveryArea?: string, subtotal = 0): Promise<number> {
    const freeThreshold = await this.getSetting('free_delivery_threshold', 2000);
    if (subtotal >= freeThreshold) return 0;

    const area = deliveryArea === 'outside' ? 'outside_dhaka' : 'inside_dhaka';
    const fee = await this.getSetting(`delivery_fee_${area}`, 80);
    return fee;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const productIds = [...new Set(dto.items.map((i) => i.productId))];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const variantIds = dto.items
      .map((i) => i.variantId)
      .filter((v): v is string => Boolean(v));

    const variants = variantIds.length
      ? await this.prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
      : [];

    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      let price = product.price;
      let unit = product.unit;
      let variantId: string | undefined;
      let variantLabel: string | undefined;

      if (item.variantId) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant || variant.productId !== product.id) {
          throw new BadRequestException(`Variant not found for product ${product.name}`);
        }
        price = this.resolvePrice(
          product,
          variant.price,
          variant.salePrice ?? product.salePrice,
        );
        unit = variant.unit;
        variantId = variant.id;
        variantLabel =
          variant.label ||
          (variant.weight > 0 ? `${variant.weight}${variant.unit}` : variant.unit);
      } else {
        price = this.resolvePrice(product, product.price, product.salePrice);
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
        unit,
        variantId,
        variantLabel,
      };
    });

    const shippingCost = await this.computeShippingCost(dto.deliveryArea, subtotal);

    let discount = 0;
    let couponId: string | undefined;
    let couponCode: string | undefined;
    if (dto.couponCode) {
      const coupon = await this.couponsService.validateOrThrow(dto.couponCode, subtotal);
      discount = this.couponsService.computeDiscount(coupon, subtotal);
      couponId = coupon.id;
      couponCode = coupon.code;
    }

    const total = Math.max(0, subtotal - discount) + shippingCost;

    const orderNumber = `NZR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        shippingName: dto.shippingName,
        shippingEmail: dto.shippingEmail || user?.email || '',
        shippingPhone: dto.shippingPhone,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity || 'Dhaka',
        shippingCountry: dto.shippingCountry || 'Bangladesh',
        shippingPostal: dto.shippingPostal,
        deliveryArea: dto.deliveryArea === 'outside' ? 'outside' : 'inside',
        paymentMethod: dto.paymentMethod,
        paymentRef: dto.paymentRef,
        subtotal,
        discount,
        couponId,
        couponCode,
        shippingCost,
        total,
        notes: dto.notes,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (couponId) {
      await this.prisma.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return order;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, variant: true } }, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByGatewayPaymentId(gatewayPaymentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { gatewayPaymentId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async storeGatewayPaymentId(id: string, gatewayPaymentId: string) {
    return this.prisma.order.update({
      where: { id },
      data: { gatewayPaymentId },
      include: { items: true },
    });
  }

  async findAllAdmin(query: QueryOrderDto) {
    const { status, search } = query;
    const pagination = parsePagination(query, 20);

    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
        { shippingEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const findManyArgs: any = {
      where,
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
    };

    if (pagination.mode === 'cursor') {
      findManyArgs.cursor = { id: pagination.cursor };
      findManyArgs.skip = 1;
    } else {
      findManyArgs.skip = pagination.skip;
    }

    const count = await this.prisma.order.count({ where });
    const rawItems = await this.prisma.order.findMany(findManyArgs);

    return buildPaginationResult(rawItems, pagination, count);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const data: any = { status: dto.status, adminNotes: dto.adminNotes };
    if (dto.status === OrderStatus.SHIPPED) data.shippedAt = new Date();
    if (dto.status === OrderStatus.DELIVERED) data.deliveredAt = new Date();
    if (dto.status === OrderStatus.CANCELLED) data.cancelledAt = new Date();

    return this.prisma.order.update({ where: { id }, data, include: { items: true } });
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    const data: any = {
      paymentStatus: dto.status as PaymentStatus,
      paymentRef: dto.paymentRef,
    };
    if (dto.status === 'PAID') {
      data.paidAt = new Date();
      data.status = OrderStatus.CONFIRMED;
    }

    return this.prisma.order.update({ where: { id }, data, include: { items: true } });
  }
}
