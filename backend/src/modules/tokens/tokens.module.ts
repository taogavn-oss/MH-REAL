import { Module } from '@nestjs/common';
import { TokensController } from './tokens.controller.js';
import { TokensService } from './tokens.service.js';
import { BullModule } from '@nestjs/bullmq';
import { InactivityProcessor } from '../../workers/inactivity.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'inactivity',
    }),
  ],
  controllers: [TokensController],
  providers: [TokensService, InactivityProcessor],
  exports: [TokensService],
})
export class TokensModule {}
