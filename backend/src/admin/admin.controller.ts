import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.adminService.getDashboardStats(userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with filters' })
  getUsers(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.getUsers(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      cursor,
      { role, search, isActive },
    );
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  createUser(
    @CurrentUser('id') userId: string,
    @Body() body: { email: string; password: string; name: string; role: UserRole },
  ) {
    return this.adminService.createUser(userId, body);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user details' })
  updateUser(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { role?: UserRole; isActive?: boolean; name?: string },
  ) {
    return this.adminService.updateUser(userId, id, body);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  deleteUser(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.adminService.deleteUser(userId, id);
  }

  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password' })
  resetPassword(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('password') password: string,
  ) {
    return this.adminService.resetUserPassword(userId, id, password);
  }

  @Post('users/:id/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock a locked user account' })
  unlockUser(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.adminService.unlockUser(userId, id);
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs' })
  getActivityLogs(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('userId') filterUserId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.getActivityLogs(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      cursor,
      {
        userId: filterUserId,
        action,
        entityType,
        search,
        startDate: from ? new Date(from) : undefined,
        endDate: to ? new Date(to) : undefined,
      },
    );
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get admin notifications' })
  getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.adminService.getNotifications(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      unreadOnly === 'true',
    );
  }

  @Put('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markNotificationRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.adminService.markNotificationRead(userId, id);
  }

  @Put('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllNotificationsRead(@CurrentUser('id') userId: string) {
    return this.adminService.markAllNotificationsRead(userId);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get all settings' })
  getSettings(@CurrentUser('id') userId: string) {
    return this.adminService.getSettings(userId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update a setting' })
  updateSetting(
    @CurrentUser('id') userId: string,
    @Body() body: { key: string; value: string; type?: string },
  ) {
    return this.adminService.updateSetting(userId, body.key, body.value, body.type);
  }

  @Put('settings/bulk')
  @ApiOperation({ summary: 'Bulk update settings' })
  bulkUpdateSettings(
    @CurrentUser('id') userId: string,
    @Body() body: { settings: { key: string; value: string; type?: string }[] },
  ) {
    return this.adminService.bulkUpdateSettings(userId, body.settings);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all roles and their permissions' })
  getPermissions(@CurrentUser('id') userId: string) {
    return this.adminService.getPermissions(userId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data' })
  getAnalytics(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.adminService.getAnalytics(userId, period || 'month');
  }
}
