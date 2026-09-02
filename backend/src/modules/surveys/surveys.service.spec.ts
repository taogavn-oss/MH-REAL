import { Test, TestingModule } from '@nestjs/testing';
import { SurveysService } from './surveys.service.js';
import { TokensService } from '../tokens/tokens.service.js';
import { SchedulesService } from '../schedules/schedules.service.js';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ candidateSurveyResponse: { create: vi.fn() }, candidate: { update: vi.fn() } }));

describe('SurveysService', () => {
  let service: SurveysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveysService,
        { provide: TokensService, useValue: { validateAndConsume: async () => 'candidate-1' } },
        { provide: SchedulesService, useValue: { autoMatch: async () => undefined } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
  });

  it('returns the submitted candidate when survey answers fail', async () => {
    prisma.candidateSurveyResponse.create.mockResolvedValue(undefined);
    prisma.candidate.update.mockResolvedValue(undefined);
    await expect(service.submit({ token: 'token', answers: { passed: false } } as never)).resolves.toEqual({ message: 'Survey submitted successfully', candidateId: 'candidate-1' });
  });
});
