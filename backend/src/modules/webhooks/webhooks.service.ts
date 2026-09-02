import { Injectable } from '@nestjs/common';
import { CandidatesService } from '../candidates/candidates.service.js';
import { TokensService } from '../tokens/tokens.service.js';
import { IntakeSource } from '../candidates/dto/create-candidate.dto.js';
import { TokenPurpose } from '../tokens/dto/create-token.dto.js';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly tokensService: TokensService,
  ) {}

  async processRikuOpWebhook(payload: any) {
    // 1. Map webhook payload to CreateCandidateDto (Normalization)
    const dto = {
      fullName: payload.name,
      email: payload.email_address,
      phone: payload.phone_number,
      source: IntakeSource.rikuop,
    };

    // 2. Register candidate (checks duplicates and blacklist)
    const candidate = await this.candidatesService.register(dto);

    // 3. Generate Token for survey
    const tokenInfo = await this.tokensService.generate({
      candidateId: candidate.id,
      purpose: TokenPurpose.survey,
    });

    // In a real system, send email/SMS with the token URL here

    return {
      message: 'RikuOp webhook processed',
      candidateId: candidate.id,
      surveyUrl: `https://frontend.example.com/survey?token=${tokenInfo.token}`,
    };
  }
}
