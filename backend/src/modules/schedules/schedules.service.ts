import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InterviewType } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Auto Matching engine called by Survey module (P5-03, P5-05)
  async autoMatch(candidateId: string, preferredDatesStr: string, storeId: string, interviewType: InterviewType) {
    const preferredDates = JSON.parse(preferredDatesStr || '[]');
    if (!preferredDates.length) {
      return this.markAdjustmentNeeded(candidateId);
    }

    // Must be at least 36 hours from now
    const bufferTime = new Date();
    bufferTime.setHours(bufferTime.getHours() + 36);

    const availableSlots = await this.prisma.interviewSlot.findMany({
      where: {
        store_id: storeId,
        status: 'open',
        start_time: { gte: bufferTime },
      },
      orderBy: { start_time: 'asc' },
    });

    // Filter slots matching preferred dates
    const matchedSlots = availableSlots.filter(slot => {
      const dateStr = slot.slot_date.toISOString().split('T')[0];
      return preferredDates.includes(dateStr);
    });

    if (!matchedSlots.length) {
      return this.markAdjustmentNeeded(candidateId);
    }

    // Try transactional booking on the first matching slot (P5-04)
    for (const slot of matchedSlots) {
      try {
        const schedule = await this.bookSlot(candidateId, slot.id, slot.version, storeId, interviewType);
        this.logger.log(`Candidate ${candidateId} booked into slot ${slot.id}`);
        
        // Advance candidate status to interview_scheduled
        await this.prisma.candidate.update({
          where: { id: candidateId },
          data: { status: 'interview_scheduled' }
        });

        return schedule;
      } catch (err) {
        if (err instanceof ConflictException) {
          // Race condition occurred, another candidate grabbed it, try next slot
          this.logger.warn(`Conflict booking slot ${slot.id}, retrying...`);
          continue;
        }
        throw err;
      }
    }

    // If all matched slots failed due to concurrency or were exhausted
    return this.markAdjustmentNeeded(candidateId);
  }

  // Transactional booking with row version locking (P5-04)
  async bookSlot(candidateId: string, slotId: string, version: number, storeId: string, interviewType: InterviewType) {
    return this.prisma.$transaction(async (tx) => {
      const updatedSlot = await tx.interviewSlot.updateMany({
        where: { id: slotId, version, status: 'open' },
        data: {
          status: 'booked',
          version: version + 1,
        }
      });

      if (updatedSlot.count === 0) {
        throw new ConflictException('Slot is no longer available or was modified concurrently');
      }

      const schedule = await tx.interviewSchedule.create({
        data: {
          candidate_id: candidateId,
          slot_id: slotId,
          store_id: storeId,
          status: 'scheduled',
          interview_type: interviewType,
        }
      });

      return schedule;
    });
  }

  private async markAdjustmentNeeded(candidateId: string) {
    this.logger.log(`Candidate ${candidateId} requires interview adjustment (no slots)`);
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'interview_adjustment_needed' }
    });
    return null;
  }
}
