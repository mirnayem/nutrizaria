import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Permission, UserRole } from '@prisma/client';

@Injectable()
export class RbacService {
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: Object.values(Permission),
    ADMIN: [
      Permission.VIEW_DASHBOARD,
      Permission.MANAGE_PRODUCTS,
      Permission.MANAGE_CATEGORIES,
      Permission.MANAGE_ORDERS,
      Permission.MANAGE_USERS,
      Permission.MANAGE_BLOGS,
      Permission.MANAGE_FAQS,
      Permission.VIEW_REPORTS,
      Permission.VIEW_ACTIVITY_LOGS,
      Permission.BULK_OPERATIONS,
    ],
    MANAGER: [
      Permission.VIEW_DASHBOARD,
      Permission.MANAGE_PRODUCTS,
      Permission.MANAGE_CATEGORIES,
      Permission.MANAGE_ORDERS,
      Permission.MANAGE_BLOGS,
      Permission.MANAGE_FAQS,
      Permission.VIEW_REPORTS,
    ],
    STAFF: [
      Permission.VIEW_DASHBOARD,
      Permission.MANAGE_ORDERS,
      Permission.VIEW_REPORTS,
    ],
    CUSTOMER: [],
  };

  constructor(private prisma: PrismaService) {}

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) return false;

    const allowedPermissions = this.rolePermissions[user.role] || [];
    return allowedPermissions.includes(permission);
  }

  async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) return false;

    const allowedPermissions = this.rolePermissions[user.role] || [];
    return permissions.some(p => allowedPermissions.includes(p));
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) return [];

    return this.rolePermissions[user.role] || [];
  }

  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  async syncPermissions() {
    for (const [role, permissions] of Object.entries(this.rolePermissions)) {
      for (const permission of permissions) {
        await this.prisma.rolePermission.upsert({
          where: {
            role_permission: {
              role: role as UserRole,
              permission: permission as Permission,
            },
          },
          update: {},
          create: {
            role: role as UserRole,
            permission: permission as Permission,
          },
        });
      }
    }
  }
}
