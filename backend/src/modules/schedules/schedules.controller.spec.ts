import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesController } from './schedules.controller.js';
import { SchedulesService } from './schedules.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

describe('SchedulesController', () => {
  let controller: SchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [{ provide: SchedulesService, useValue: {} }],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
  });

  it('returns the cancellation acknowledgement for the requested schedule', async () => {
    await expect(controller.cancelSchedule({}, 'schedule-1')).resolves.toEqual({ message: 'Schedule cancelled', id: 'schedule-1' });
  });
});
