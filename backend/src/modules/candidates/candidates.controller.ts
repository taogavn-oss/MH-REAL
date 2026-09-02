import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  /*
  // Disabled as per SRC-ROUTE-C-01 - not in approved OpenAPI registry
  @Post('manual')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HQ')
  @ApiOperation({ summary: 'HQ Manual Candidate Registration (P4-08)' })
  async registerManual(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.register(dto);
  }
  */
}
