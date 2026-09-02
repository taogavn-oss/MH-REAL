import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service.js';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    const { notificationId } = job.data;
    
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.status === 'sent') return;

    this.logger.log(`Sending notification ${notificationId} via ${notification.channel}`);

    try {
      // Mock external delivery (AWS SES, Twilio, etc)
      // throw new Error('Mock failure') to test retries
      
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'sent',
          sent_at: new Date(),
        }
      });
      
      this.logger.log(`Successfully sent notification ${notificationId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send notification ${notificationId}`, error);
      throw error; // Let BullMQ handle the retry mechanism
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    if (job.name === 'send-notification') {
      const { notificationId } = job.data;
      
      const notif = await this.prisma.notification.findUnique({ where: { id: notificationId } });
      if (notif) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            retry_count: notif.retry_count + 1,
            error_message: error.message,
            status: job.attemptsMade >= job.opts.attempts! ? 'failed' : 'scheduled'
          }
        });
      }
    }
  }
}
