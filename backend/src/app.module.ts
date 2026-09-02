import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './infrastructure/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { MasterDataModule } from './modules/master-data/master-data.module.js';
import { JobRequirementsModule } from './modules/job-requirements/job-requirements.module.js';
import { CandidatesModule } from './modules/candidates/candidates.module.js';
import { TokensModule } from './modules/tokens/tokens.module.js';
import { SurveysModule } from './modules/surveys/surveys.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { SlotsModule } from './modules/slots/slots.module.js';
import { SchedulesModule } from './modules/schedules/schedules.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { RemindersModule } from './modules/reminders/reminders.module.js';
import { RikuopOutboundModule } from './modules/rikuop-outbound/rikuop-outbound.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    PrismaModule,
    AuthModule,
    MasterDataModule,
    JobRequirementsModule,
    CandidatesModule,
    TokensModule,
    SurveysModule,
    WebhooksModule,
    SlotsModule,
    SchedulesModule,
    NotificationsModule,
    RemindersModule,
    RikuopOutboundModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
