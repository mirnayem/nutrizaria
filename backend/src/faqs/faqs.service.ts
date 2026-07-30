import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, UpdateFaqDto } from './dto';

@Injectable()
export class FaqsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faq.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findAllAdmin() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    await this.prisma.faq.delete({ where: { id } });
  }
}
