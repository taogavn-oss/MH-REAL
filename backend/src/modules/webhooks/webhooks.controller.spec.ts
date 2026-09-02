import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { vi } from 'vitest';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  const webhooksService = { processRikuOpWebhook: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: webhooksService }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('returns the webhook processing result', async () => {
    const payload = { id: 'event-1' };
    webhooksService.processRikuOpWebhook.mockResolvedValue({ candidateId: 'candidate-1' });
    await expect(controller.rikuOpWebhook(payload)).resolves.toEqual({ candidateId: 'candidate-1' });
    expect(webhooksService.processRikuOpWebhook).toHaveBeenCalledWith(payload);
  });
});
