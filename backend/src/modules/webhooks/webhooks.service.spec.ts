import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from './webhooks.service.js';
import { CandidatesService } from '../candidates/candidates.service.js';
import { TokensService } from '../tokens/tokens.service.js';

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhooksService,
        { provide: CandidatesService, useValue: { register: async () => ({ id: 'candidate-1' }) } },
        { provide: TokensService, useValue: { generate: async () => ({ token: 'survey-token' }) } },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  it('returns a survey URL for the registered candidate', async () => {
    await expect(service.processRikuOpWebhook({ name: 'Ada', email_address: 'ada@example.com', phone_number: '123' })).resolves.toEqual({
      message: 'RikuOp webhook processed', candidateId: 'candidate-1', surveyUrl: 'https://frontend.example.com/survey?token=survey-token',
    });
  });
});
