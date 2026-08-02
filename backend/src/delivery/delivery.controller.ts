import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

@SkipThrottle()
@Controller('delivery')
export class DeliveryController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getConfig() {
    const keys = [
      'delivery_fee_inside_dhaka',
      'delivery_fee_outside_dhaka',
      'free_delivery_threshold',
      'currency',
      'currency_symbol',
    ];
    const rows = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    return {
      insideDhakaFee: Number(map.delivery_fee_inside_dhaka ?? 80),
      outsideDhakaFee: Number(map.delivery_fee_outside_dhaka ?? 150),
      freeDeliveryThreshold: Number(map.free_delivery_threshold ?? 2000),
      currency: map.currency || 'bdt',
      currencySymbol: map.currency_symbol || 'Tk',
    };
  }
}