import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service.js';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('rikuop')
  @ApiOperation({ summary: 'Webhook for RikuOp candidate inbound (P4-06)' })
  async rikuOpWebhook(@Body() payload: any) {
    return this.webhooksService.processRikuOpWebhook(payload);
  }
}
