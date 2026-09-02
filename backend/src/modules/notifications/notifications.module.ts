import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from '../../workers/notification.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationsService, NotificationProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
