import { Test, TestingModule } from '@nestjs/testing';
import { RikuopOutboundService } from './rikuop-outbound.service.js';
import { getQueueToken } from '@nestjs/bullmq';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ rikuopSyncLog: { create: vi.fn() } }));

describe('RikuopOutboundService', () => {
  let service: RikuopOutboundService;
  const queue = { add: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RikuopOutboundService, { provide: getQueueToken('rikuop_outbound'), useValue: queue }, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RikuopOutboundService>(RikuopOutboundService);
  });

  it('returns the outbound sync log entry after enqueueing it', async () => {
    const logEntry = { id: 'sync-1' };
    prisma.rikuopSyncLog.create.mockResolvedValue(logEntry);
    queue.add.mockResolvedValue(undefined);
    await expect(service.enqueueOutboundSync('candidate', 'candidate-1', { status: 'passed' })).resolves.toEqual(logEntry);
  });
});
