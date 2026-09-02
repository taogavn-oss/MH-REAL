import { Test, TestingModule } from '@nestjs/testing';
import { MasterDataService } from './master-data.service.js';

describe('MasterDataService', () => {
  let service: MasterDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterDataService],
    }).compile();

    service = module.get<MasterDataService>(MasterDataService);
  });

  it('has no import operation until the pending format contract is defined', () => {
    expect(Object.getOwnPropertyNames(Object.getPrototypeOf(service))).toEqual(['constructor']);
  });
});
