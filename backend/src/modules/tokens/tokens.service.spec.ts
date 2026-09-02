import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service.js';
import { getQueueToken } from '@nestjs/bullmq';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ candidate: { findUnique: vi.fn() } }));

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensService, { provide: getQueueToken('inactivity'), useValue: { add: async () => undefined, getJob: async () => undefined } }, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('rejects token generation for an unknown candidate', async () => {
    prisma.candidate.findUnique.mockResolvedValue(null);
    await expect(service.generate({ candidateId: 'missing-candidate' } as never)).rejects.toThrow('Candidate not found');
  });
});
