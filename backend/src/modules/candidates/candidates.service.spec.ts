import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = {};

describe('CandidatesService', () => {
  let service: CandidatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
  });

  it('rejects a candidate without either email or phone', async () => {
    await expect(service.register({ fullName: 'Ada' } as never)).rejects.toThrow('At least email or phone must be provided');
  });
});
