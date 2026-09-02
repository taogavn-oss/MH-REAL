import { Injectable, BadRequestException } from '@nestjs/common';
import { InterviewType } from '@prisma/client';
import { SubmitSurveyDto } from './dto/submit-survey.dto.js';
import { TokensService } from '../tokens/tokens.service.js';
import { SchedulesService } from '../schedules/schedules.service.js';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class SurveysService {
  constructor(
    private readonly tokensService: TokensService,
    private readonly schedulesService: SchedulesService,
    private readonly prisma: PrismaService,
  ) { }

  async submit(dto: SubmitSurveyDto) {
    // 1. Validate token and consume it (this cancels the timeout job)
    const candidateId = await this.tokensService.validateAndConsume(dto.token, 'survey');

    // 2. Save Survey Response (mock fields for simplicity)
    const preferredDates = dto.answers.preferredDates || [];
    const interviewType = dto.answers.interviewType === 'web' ? 'web' : 'onsite';

    await this.prisma.candidateSurveyResponse.create({
      data: {
        candidate_id: candidateId,
        desired_store_ids: [],
        preferred_dates: preferredDates,
        interview_type: interviewType,
        submitted_at: new Date(),
      }
    });

    // 3. Evaluate survey outcome
    const passed = dto.answers.passed === true;

    if (passed) {
      // 4. Auto Match (P5-03, P5-05)
      // Retrieve the store from candidate info
      const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
      if (candidate?.store_id) {
        await this.schedulesService.autoMatch(
          candidateId,
          JSON.stringify(preferredDates),
          candidate.store_id,
          interviewType as InterviewType
        );
      } else {
        await this.prisma.candidate.update({ where: { id: candidateId }, data: { status: 'passed' } });
      }
    } else {
      await this.prisma.candidate.update({ where: { id: candidateId }, data: { status: 'failed' } });
    }

    return { message: 'Survey submitted successfully', candidateId };
  }
}
