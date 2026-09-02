import { Test, TestingModule } from '@nestjs/testing';
import { SlotsController } from './slots.controller.js';
import { SlotsService } from './slots.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { vi } from 'vitest';

describe('SlotsController', () => {
  let controller: SlotsController;
  const slotsService = { getTimeline: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotsController],
      providers: [{ provide: SlotsService, useValue: slotsService }],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<SlotsController>(SlotsController);
  });

  it('returns the slot timeline result', async () => {
    const query = { storeId: 'store-1' };
    slotsService.getTimeline.mockResolvedValue({ data: [], total: 0 });
    await expect(controller.getTimeline(query)).resolves.toEqual({ data: [], total: 0 });
    expect(slotsService.getTimeline).toHaveBeenCalledWith(query);
  });
});
