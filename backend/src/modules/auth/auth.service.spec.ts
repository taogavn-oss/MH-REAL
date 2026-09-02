import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { vi } from 'vitest';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const prisma = vi.hoisted(() => ({ user: { findUnique: vi.fn() } }));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: JwtService, useValue: { sign: () => 'token' } }, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('rejects a login for an unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login('missing@example.com', 'password')).rejects.toThrow('Invalid credentials');
  });
});
