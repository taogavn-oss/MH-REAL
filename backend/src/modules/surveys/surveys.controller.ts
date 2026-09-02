import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SurveysService } from './surveys.service.js';
import { SubmitSurveyDto } from './dto/submit-survey.dto.js';

@ApiTags('Surveys')
@Controller('public/survey')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get screening survey form (Public, Token Auth)' })
  async getSurvey(@Param('token') token: string) {
    // Stub for API-008
    return { token, message: 'Survey form' };
  }

  @Post(':token')
  @ApiOperation({ summary: 'Submit screening survey (Public, Token Auth)' })
  async submit(@Param('token') token: string, @Body() dto: SubmitSurveyDto) {
    return this.surveysService.submit(dto);
  }
}
