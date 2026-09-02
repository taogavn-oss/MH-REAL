import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: { login: async () => ({ access_token: 'token' }) } }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('returns the existing reset-request acknowledgement', async () => {
    await expect(controller.forgotPassword('person@example.com')).resolves.toEqual({
      message: 'If the email exists, a reset link will be sent.',
    });
  });
});
