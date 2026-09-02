import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataController } from './master-data.controller.js';
import { MasterDataService } from './master-data.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

describe('MasterDataController', () => {
  let controller: MasterDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterDataController],
      providers: [MasterDataService],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<MasterDataController>(MasterDataController);
  });

  it('returns pending status for an uploaded file', async () => {
    await expect(controller.importData({ originalname: 'stores.csv' })).resolves.toEqual({
      message: 'File import validation passed (stub).', filename: 'stores.csv', status: 'pending_logic',
    });
  });
});
