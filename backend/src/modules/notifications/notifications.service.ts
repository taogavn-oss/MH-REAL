import { Injectable, Logger } from '@nestjs/common';
import { NotificationRecipient, NotificationChannel } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@InjectQueue('notifications') private notificationsQueue: Queue, private readonly prisma: PrismaService) {}

  async scheduleNotification(params: {
    recipientType: NotificationRecipient;
    recipientId: string;
    channel: NotificationChannel;
    templateCode: string;
    payload?: any;
    scheduledAt?: Date;
  }) {
    const scheduledAt = params.scheduledAt || new Date();
    const idempotencyKey = `notif-${params.templateCode}-${params.recipientId}-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const notification = await this.prisma.notification.create({
      data: {
        recipient_type: params.recipientType,
        recipient_id: params.recipientId,
        channel: params.channel,
        template_code: params.templateCode,
        payload: params.payload || {},
        status: 'scheduled',
        idempotency_key: idempotencyKey,
        scheduled_at: scheduledAt,
      }
    });

    const delay = scheduledAt.getTime() - Date.now();

    await this.notificationsQueue.add('send-notification', { notificationId: notification.id }, {
      jobId: notification.id, // BullMQ idempotency per notification
      delay: delay > 0 ? delay : 0,
      attempts: 3, // Bounded retry (P6-01)
      backoff: {
        type: 'exponential',
        delay: 5000,
      }
    });

    this.logger.log(`Scheduled notification ${notification.id} for ${params.recipientId} at ${scheduledAt}`);
    return notification;
  }
}
