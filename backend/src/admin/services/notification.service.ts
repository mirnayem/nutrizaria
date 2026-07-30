import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType, UserRole } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(
    type: NotificationType,
    title: string,
    message: string,
    userId?: string,
    metadata?: any,
  ) {
    return this.prisma.adminNotification.create({
      data: {
        type,
        title,
        message,
        userId,
        metadata,
      },
    });
  }

  async notifyAllAdmins(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
  ) {
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER] },
        isActive: true,
      },
      select: { id: true },
    });

    const notifications = admins.map((admin) => ({
      type,
      title,
      message,
      userId: admin.id,
      metadata,
    }));

    return this.prisma.adminNotification.createMany({ data: notifications });
  }

  async findByUser(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.adminNotification.count({ where }),
      this.prisma.adminNotification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.adminNotification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.adminNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(notificationId: string, userId: string) {
    return this.prisma.adminNotification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async clearAll(userId: string) {
    return this.prisma.adminNotification.deleteMany({
      where: { userId },
    });
  }
}
