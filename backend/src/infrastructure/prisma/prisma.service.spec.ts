import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('connects and disconnects through the Nest lifecycle hooks', async () => {
    const prisma = new PrismaService();
    const connect = vi.spyOn(prisma, '$connect').mockResolvedValue(undefined);
    const disconnect = vi
      .spyOn(prisma, '$disconnect')
      .mockResolvedValue(undefined);

    await prisma.onModuleInit();
    await prisma.onModuleDestroy();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
