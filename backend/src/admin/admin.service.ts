import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../common/services/rbac.service';
import { ActivityLogService } from './services/activity-log.service';
import { NotificationService } from './services/notification.service';
import { Permission, UserRole, ActivityAction, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private rbac: RbacService,
    private activityLog: ActivityLogService,
    private notification: NotificationService,
  ) {}

  async getDashboardStats(adminUserId: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.VIEW_DASHBOARD);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      totalUsers,
      newUsersThisMonth,
      totalCategories,
      recentOrders,
      topProducts,
      ordersByStatus,
      ordersByPayment,
      activityStats,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: lastMonth } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: lastMonth } } }),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 3 },
          user: { select: { name: true, email: true } },
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.groupBy({ by: ['status'], _count: true }),
      this.prisma.order.groupBy({ by: ['paymentMethod'], _count: true }),
      this.activityLog.getStats(7),
    ]);

    const topProductIds = topProducts.map((p) => p.productId);
    const topProductDetails = topProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, image: true, price: true },
        })
      : [];

    return {
      overview: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        monthRevenue: monthRevenue._sum.total || 0,
        totalUsers,
        newUsersThisMonth,
        totalCategories,
      },
      recentOrders,
      topProducts: topProducts.map((tp) => ({
        ...topProductDetails.find((p) => p.id === tp.productId),
        totalSold: tp._sum.quantity || 0,
        orderCount: tp._count,
      })),
      ordersByStatus: ordersByStatus.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
      ordersByPayment: ordersByPayment.reduce((acc, p) => {
        acc[p.paymentMethod] = p._count;
        return acc;
      }, {} as Record<string, number>),
      activityStats,
    };
  }

  async getUsers(adminUserId: string, page = 1, limit = 20, filters?: { role?: string; search?: string; isActive?: string }) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.role) where.role = filters.role as UserRole;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive === 'true';
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          lastLoginIp: true,
          loginAttempts: true,
          lockedUntil: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUser(adminUserId: string, userId: string, data: { role?: UserRole; isActive?: boolean; name?: string }) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
    if (admin!.role !== UserRole.SUPER_ADMIN && data.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can assign super admin role');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.UPDATE,
      'User',
      userId,
      `Updated user ${user.email}: ${JSON.stringify(data)}`,
    );

    return updated;
  }

  async createUser(adminUserId: string, data: { email: string; password: string; name: string; role: UserRole }) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        emailVerified: true,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.CREATE,
      'User',
      user.id,
      `Created user ${user.email} with role ${user.role}`,
    );

    return user;
  }

  async deleteUser(adminUserId: string, userId: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    if (adminUserId === userId) throw new BadRequestException('Cannot delete yourself');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({ where: { role: UserRole.SUPER_ADMIN } });
      if (superAdminCount <= 1) throw new BadRequestException('Cannot delete the last super admin');
    }

    await this.prisma.user.delete({ where: { id: userId } });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.DELETE,
      'User',
      userId,
      `Deleted user ${user.email}`,
    );

    return { success: true };
  }

  async resetUserPassword(adminUserId: string, userId: string, newPassword: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, loginAttempts: 0, lockedUntil: null },
    });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.UPDATE,
      'User',
      userId,
      `Reset password for ${user.email}`,
    );

    return { success: true };
  }

  async unlockUser(adminUserId: string, userId: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_USERS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    await this.prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.UPDATE,
      'User',
      userId,
      'Unlocked user account',
    );

    return { success: true };
  }

  async getActivityLogs(adminUserId: string, page = 1, limit = 50, filters?: any) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.VIEW_ACTIVITY_LOGS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    return this.activityLog.findAll({ ...filters, page, limit });
  }

  async getNotifications(adminUserId: string, page = 1, limit = 20, unreadOnly = false) {
    return this.notification.findByUser(adminUserId, page, limit, unreadOnly);
  }

  async markNotificationRead(adminUserId: string, notificationId: string) {
    return this.notification.markAsRead(notificationId, adminUserId);
  }

  async markAllNotificationsRead(adminUserId: string) {
    return this.notification.markAllAsRead(adminUserId);
  }

  async getSettings(adminUserId: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_SETTINGS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSetting(adminUserId: string, key: string, value: string, type = 'string') {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_SETTINGS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const stringValue = value === null || value === undefined ? '' : String(value);

    const setting = await this.prisma.setting.upsert({
      where: { key },
      update: { value: stringValue, type },
      create: { key, value: stringValue, type },
    });

    await this.activityLog.log(
      adminUserId,
      ActivityAction.UPDATE,
      'Setting',
      key,
      `Updated setting ${key} to ${value}`,
    );

    return setting;
  }

  async bulkUpdateSettings(adminUserId: string, settings: { key: string; value: string; type?: string }[]) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_SETTINGS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const results: any[] = [];
    for (const s of settings) {
      const stringValue = s.value === null || s.value === undefined ? '' : String(s.value);
      const setting = await this.prisma.setting.upsert({
        where: { key: s.key },
        update: { value: stringValue, type: s.type || 'string' },
        create: { key: s.key, value: stringValue, type: s.type || 'string' },
      });
      results.push(setting);
    }

    await this.activityLog.log(
      adminUserId,
      ActivityAction.BULK_UPDATE,
      'Setting',
      undefined,
      `Bulk updated ${settings.length} settings`,
    );

    return results;
  }

  async getPermissions(adminUserId: string) {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.MANAGE_ROLES);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const roles = Object.values(UserRole);
    return roles.map((role) => ({
      role,
      permissions: this.rbac.getRolePermissions(role),
    }));
  }

  async getAnalytics(adminUserId: string, period: 'week' | 'month' | 'year' = 'month') {
    const hasPermission = await this.rbac.hasPermission(adminUserId, Permission.VIEW_REPORTS);
    if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    const [revenueByDay, ordersByDay, newUsersByDay, topCategories] = await Promise.all([
      this.prisma.order.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: startDate } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { role: 'CUSTOMER', createdAt: { gte: startDate } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { createdAt: { gte: startDate } } },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
    ]);

    const topProductIds = topCategories.map((c) => c.productId);
    const topProductDetails = topProductIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, category: { select: { name: true } } },
        })
      : [];

    return {
      revenueByDay,
      ordersByDay,
      newUsersByDay,
      topProducts: topCategories.map((tc) => ({
        ...topProductDetails.find((p) => p.id === tc.productId),
        totalSold: tc._sum.quantity || 0,
        totalRevenue: (tc._sum.price || 0) * (tc._sum.quantity || 0),
      })),
    };
  }
}
