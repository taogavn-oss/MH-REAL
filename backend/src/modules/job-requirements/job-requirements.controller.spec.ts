import { Test, TestingModule } from '@nestjs/testing';
import { JobRequirementsController } from './job-requirements.controller.js';
import { JobRequirementsService } from './job-requirements.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

describe('JobRequirementsController', () => {
  let controller: JobRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobRequirementsController],
      providers: [{ provide: JobRequirementsService, useValue: {} }],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<JobRequirementsController>(JobRequirementsController);
  });

  it('returns the existing import acknowledgement', async () => {
    await expect(controller.importRequirements()).resolves.toEqual({
      message: 'File import validation passed (stub for P3-05 pending OPN-005).',
    });
  });
});
