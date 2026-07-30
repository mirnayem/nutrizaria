import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser('id') userId: string, @Body() body: { productId: string; quantity?: number }) {
    return this.cartService.addItem(userId, body.productId, body.quantity || 1);
  }

  @Put('items/:id')
  updateItem(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItem(userId, id, body.quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
