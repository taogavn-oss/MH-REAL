import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(private readonly notificationsService: NotificationsService, private readonly prisma: PrismaService) {}

  // Run daily at midnight to check for stale requirements (P6-03)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkStaleRequirements() {
    this.logger.log('Running daily check for stale job requirements');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const staleReqs = await this.prisma.jobRequirement.findMany({
      where: {
        status: { in: ['pending_am', 'pending_hq'] },
        updated_at: { lt: threeDaysAgo },
      },
      include: { store: true }
    });

    for (const req of staleReqs) {
      // Find the user responsible (mocking recipient logic for brevity)
      const recipientId = req.created_by; // Ideally this would query AM or HQ role
      if (recipientId) {
        await this.notificationsService.scheduleNotification({
          recipientType: 'internal_user',
          recipientId,
          channel: 'email',
          templateCode: 'APPROVAL_REMINDER',
          payload: { requirementId: req.id, status: req.status },
        });
      }
    }
  }

  // Run hourly to check for upcoming interviews in the next 24 hours (P6-04)
  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingInterviews() {
    this.logger.log('Running hourly check for upcoming interviews');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    const upcoming = await this.prisma.interviewSchedule.findMany({
      where: {
        status: 'scheduled',
        reminder_sent_at: null,
        slot: {
          start_time: { gte: in23Hours, lte: in24Hours }
        }
      },
      include: { candidate: true, slot: true }
    });

    for (const schedule of upcoming) {
      await this.notificationsService.scheduleNotification({
        recipientType: 'candidate',
        recipientId: schedule.candidate_id,
        channel: 'email', // Could be SMS
        templateCode: 'INTERVIEW_REMINDER_24H',
        payload: { scheduleId: schedule.id, time: schedule.slot.start_time },
      });

      // Mark reminder as sent
      await this.prisma.interviewSchedule.update({
        where: { id: schedule.id },
        data: { reminder_sent_at: new Date() }
      });
    }
  }
}
