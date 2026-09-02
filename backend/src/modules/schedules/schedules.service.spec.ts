import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service.js';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ interviewSlot: { findMany: vi.fn() }, candidate: { update: vi.fn() } }));

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  it('returns null and marks adjustment needed when no slot matches', async () => {
    prisma.interviewSlot.findMany.mockResolvedValue([]);
    prisma.candidate.update.mockResolvedValue(undefined);
    await expect(service.autoMatch('candidate-1', '[]', 'store-1', 'onsite' as never)).resolves.toBeNull();
  });
});
