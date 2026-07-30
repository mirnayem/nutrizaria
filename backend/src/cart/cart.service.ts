import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: { include: { category: true } } } } },
      });
    }
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    return this.prisma.cartItem.update({
      where: { id: itemId, cartId: cart.id },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    return this.prisma.cartItem.delete({ where: { id: itemId, cartId: cart.id } });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}
