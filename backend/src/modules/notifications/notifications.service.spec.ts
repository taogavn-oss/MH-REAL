import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { getQueueToken } from '@nestjs/bullmq';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ notification: { create: vi.fn() } }));

describe('NotificationsService', () => {
  let service: NotificationsService;
  const queue = { add: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: getQueueToken('notifications'), useValue: queue }, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('returns the persisted notification after enqueueing it', async () => {
    const notification = { id: 'notification-1' };
    prisma.notification.create.mockResolvedValue(notification);
    queue.add.mockResolvedValue(undefined);
    await expect(service.scheduleNotification({ recipientType: 'candidate', recipientId: 'candidate-1', channel: 'email', templateCode: 'INTERVIEW_REMINDER_24H' } as never)).resolves.toEqual(notification);
  });
});
