import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';
import { parsePagination, buildPaginationResult } from '../../common/pagination';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string,
    action: ActivityAction,
    entityType: string,
    entityId?: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.adminActivityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(filters?: {
    userId?: string;
    action?: ActivityAction;
    entityType?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    cursor?: string;
  }) {
    const { userId, action, entityType, search, startDate, endDate, page = 1, limit = 50, cursor } = filters || {};
    const pagination = parsePagination({ page, limit, cursor }, 50);

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    if (search) {
      where.OR = [
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
        { user: { is: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const findManyArgs: any = {
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
    };

    if (pagination.mode === 'cursor') {
      findManyArgs.cursor = { id: pagination.cursor };
      findManyArgs.skip = 1;
    } else {
      findManyArgs.skip = pagination.skip;
    }

    const count = await this.prisma.adminActivityLog.count({ where });
    const rawLogs = await this.prisma.adminActivityLog.findMany(findManyArgs);

    const result = buildPaginationResult(rawLogs, pagination, count);
    return { logs: result.items, meta: result.meta };
  }

  async findByUser(userId: string, page = 1, limit = 50) {
    return this.findAll({ userId, page, limit });
  }

  async getStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.prisma.adminActivityLog.groupBy({
      by: ['action'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    return stats.reduce((acc, stat) => {
      acc[stat.action] = stat._count;
      return acc;
    }, {} as Record<string, number>);
  }
}
