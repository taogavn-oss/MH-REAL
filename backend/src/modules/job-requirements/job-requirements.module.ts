import { Module } from '@nestjs/common';
import { JobRequirementsController } from './job-requirements.controller.js';
import { JobRequirementsService } from './job-requirements.service.js';

@Module({
  controllers: [JobRequirementsController],
  providers: [JobRequirementsService]
})
export class JobRequirementsModule {}
