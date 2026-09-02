import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [NotificationsModule, ScheduleModule.forRoot()],
  providers: [RemindersService],
})
export class RemindersModule {}
