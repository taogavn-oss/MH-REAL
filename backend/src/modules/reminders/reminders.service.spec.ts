import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ jobRequirement: { findMany: vi.fn() } }));

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemindersService, { provide: NotificationsService, useValue: { scheduleNotification: async () => undefined } }, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  it('completes the stale-requirements check when none are stale', async () => {
    prisma.jobRequirement.findMany.mockResolvedValue([]);
    await expect(service.checkStaleRequirements()).resolves.toBeUndefined();
  });
});
