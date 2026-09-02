import { Module } from '@nestjs/common';
import { SurveysController } from './surveys.controller.js';
import { SurveysService } from './surveys.service.js';
import { TokensModule } from '../tokens/tokens.module.js';
import { SchedulesModule } from '../schedules/schedules.module.js';

@Module({
  imports: [TokensModule, SchedulesModule],
  controllers: [SurveysController],
  providers: [SurveysService],
})
export class SurveysModule {}
