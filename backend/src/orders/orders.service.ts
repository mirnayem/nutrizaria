import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto, QueryOrderDto } from './dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) } },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('One or more products not found');
    }

    let subtotal = 0;
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
      };
    });

    const shippingCost = subtotal >= 2000 ? 0 : 80;
    const total = subtotal + shippingCost;

    const orderNumber = `NZR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        shippingName: dto.shippingName,
        shippingEmail: dto.shippingEmail,
        shippingPhone: dto.shippingPhone,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity,
        shippingCountry: dto.shippingCountry || 'Bangladesh',
        shippingPostal: dto.shippingPostal,
        paymentMethod: dto.paymentMethod,
        paymentRef: dto.paymentRef,
        subtotal,
        shippingCost,
        total,
        notes: dto.notes,
        items: { create: orderItems },
      },
      include: { items: true },
    });

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
      include: { items: { include: { product: true } }, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAllAdmin(query: QueryOrderDto) {
    const { page = 1, limit = 20, status, search } = query;
    const where: any = {};
    if (status) where.status = status as OrderStatus;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingName: { contains: search, mode: 'insensitive' } },
        { shippingEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
