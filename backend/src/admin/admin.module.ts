import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ActivityLogService } from './services/activity-log.service';
import { NotificationService } from './services/notification.service';
import { RbacService } from '../common/services/rbac.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ActivityLogService, NotificationService, RbacService],
  exports: [AdminService, ActivityLogService, NotificationService, RbacService],
})
export class AdminModule {}
