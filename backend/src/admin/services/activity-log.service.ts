import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';

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
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { userId, action, entityType, startDate, endDate, page = 1, limit = 50 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminActivityLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminActivityLog.count({ where }),
    ]);

    return {
      logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
