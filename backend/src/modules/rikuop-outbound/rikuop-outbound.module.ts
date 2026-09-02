import { Module } from '@nestjs/common';
import { RikuopOutboundService } from './rikuop-outbound.service.js';
import { BullModule } from '@nestjs/bullmq';
import { RikuopOutboundProcessor } from '../../workers/rikuop-outbound.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'rikuop_outbound',
    }),
  ],
  providers: [RikuopOutboundService, RikuopOutboundProcessor],
  exports: [RikuopOutboundService],
})
export class RikuopOutboundModule {}
