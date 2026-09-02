import { Injectable, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSlot(userId: string, dto: CreateSlotDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    const slotDate = new Date(dto.slotDate);

    // 1. Guard against past dates
    if (start < new Date()) {
      throw new BadRequestException('Cannot create a slot in the past');
    }

    if (start >= end) {
      throw new BadRequestException('Start time must be before end time');
    }

    // 2. Guard against overlap for the SM (Prisma handles exact constraint, but we check ranges)
    const overlap = await this.prisma.interviewSlot.findFirst({
      where: {
        sm_user_id: userId,
        slot_date: slotDate,
        OR: [
          { start_time: { lt: end }, end_time: { gt: start } },
        ]
      }
    });

    if (overlap) {
      throw new ConflictException('Slot time overlaps with an existing slot');
    }

    // 3. Create Slot
    const slot = await this.prisma.interviewSlot.create({
      data: {
        store_id: dto.storeId,
        sm_user_id: userId,
        slot_date: slotDate,
        start_time: start,
        end_time: end,
        status: 'open',
        note: dto.note,
        version: 1,
        created_by: userId,
      }
    });

    return slot;
  }

  async cancelSlot(userId: string, slotId: string) {
    const slot = await this.prisma.interviewSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new BadRequestException('Slot not found');

    if (slot.sm_user_id !== userId) {
      throw new ForbiddenException('Cannot cancel a slot that does not belong to you');
    }

    if (slot.status === 'booked') {
      throw new ConflictException('Cannot cancel a booked slot directly without rescheduling');
    }

    const updated = await this.prisma.interviewSlot.update({
      where: { id: slotId, version: slot.version },
      data: {
        status: 'closed',
        version: slot.version + 1,
        updated_by: userId,
      }
    });

    return updated;
  }

  async getTimeline(filters: any) {
    // Basic timeline fetch for HQ (P5-02)
    const { storeId, areaId, dateStart, dateEnd, skip = 0, take = 50 } = filters;

    const where: any = {};
    if (storeId) where.store_id = storeId;
    if (dateStart || dateEnd) {
      where.slot_date = {};
      if (dateStart) where.slot_date.gte = new Date(dateStart);
      if (dateEnd) where.slot_date.lte = new Date(dateEnd);
    }
    // Note: areaId filtering requires relation JOIN which we can handle via include/where
    if (areaId) {
      where.store = { area_id: areaId };
    }

    const [slots, total] = await Promise.all([
      this.prisma.interviewSlot.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        orderBy: { start_time: 'asc' },
        include: { store: true, sm: { select: { id: true, email: true } } }
      }),
      this.prisma.interviewSlot.count({ where })
    ]);

    return { data: slots, total };
  }
}
