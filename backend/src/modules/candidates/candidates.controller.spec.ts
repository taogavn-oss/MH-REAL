import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller.js';
import { CandidatesService } from './candidates.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { vi } from 'vitest';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  const candidatesService = { register: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [{ provide: CandidatesService, useValue: candidatesService }],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
  });

  it('returns the candidate registration result', async () => {
    const dto = { fullName: 'Ada', email: 'ada@example.com' } as never;
    candidatesService.register.mockResolvedValue({ id: 'candidate-1' });
    await expect(controller.registerManual(dto)).resolves.toEqual({ id: 'candidate-1' });
    expect(candidatesService.register).toHaveBeenCalledWith(dto);
  });
});
