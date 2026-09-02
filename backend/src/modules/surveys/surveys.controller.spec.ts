import { Test, TestingModule } from '@nestjs/testing';
import { SurveysController } from './surveys.controller.js';
import { SurveysService } from './surveys.service.js';
import { vi } from 'vitest';

describe('SurveysController', () => {
  let controller: SurveysController;
  const surveysService = { submit: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [{ provide: SurveysService, useValue: surveysService }],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
  });

  it('returns the survey submission result', async () => {
    const dto = { token: 'token', answers: {} } as never;
    surveysService.submit.mockResolvedValue({ message: 'Survey submitted successfully', candidateId: 'candidate-1' });
    await expect(controller.submit(dto)).resolves.toEqual({ message: 'Survey submitted successfully', candidateId: 'candidate-1' });
    expect(surveysService.submit).toHaveBeenCalledWith(dto);
  });
});
