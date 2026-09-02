import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementsService } from './job-requirements.service.js';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ jobRequirement: { findMany: vi.fn() } }));

describe('JobRequirementsService', () => {
  let service: JobRequirementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobRequirementsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<JobRequirementsService>(JobRequirementsService);
  });

  it('returns the matching requirements from the persistence boundary', async () => {
    prisma.jobRequirement.findMany.mockResolvedValue([]);
    await expect(service.list({ status: 'draft' })).resolves.toEqual([]);
  });
});
