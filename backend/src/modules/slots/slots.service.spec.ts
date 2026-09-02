import { Test, TestingModule } from '@nestjs/testing';
import { SlotsService } from './slots.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = {};

describe('SlotsService', () => {
  let service: SlotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlotsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
  });

  it('rejects a slot whose start time is in the past', async () => {
    await expect(service.createSlot({} as never, { startTime: '2000-01-01T09:00:00.000Z', endTime: '2000-01-01T10:00:00.000Z', slotDate: '2000-01-01' } as never)).rejects.toThrow('Cannot create a slot in the past');
  });
});
