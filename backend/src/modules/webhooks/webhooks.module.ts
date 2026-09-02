import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { CandidatesModule } from '../candidates/candidates.module.js';
import { TokensModule } from '../tokens/tokens.module.js';

@Module({
  imports: [CandidatesModule, TokensModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
