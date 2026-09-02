import { Test, TestingModule } from '@nestjs/testing';
import { TokensController } from './tokens.controller.js';
import { TokensService } from './tokens.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { vi } from 'vitest';

describe('TokensController', () => {
  let controller: TokensController;
  const tokensService = { generate: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [{ provide: TokensService, useValue: tokensService }],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<TokensController>(TokensController);
  });

  it('returns the generated token result', async () => {
    const dto = { candidateId: 'candidate-1' } as never;
    tokensService.generate.mockResolvedValue({ tokenId: 'token-1', token: 'raw-token' });
    await expect(controller.generateToken(dto)).resolves.toEqual({ tokenId: 'token-1', token: 'raw-token' });
    expect(tokensService.generate).toHaveBeenCalledWith(dto);
  });
});
