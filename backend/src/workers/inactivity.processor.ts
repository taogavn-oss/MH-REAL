import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../infrastructure/prisma/prisma.service.js';

@Processor('inactivity')
export class InactivityProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job<any, any, string>): Promise<any> {
    const { tokenId, candidateId } = job.data;
    
    // Check if the token is still unused
    const token = await this.prisma.candidateSurveyToken.findUnique({ where: { id: tokenId } });
    if (!token) return; // Token doesn't exist anymore

    if (!token.used_at) {
      // Mark candidate as no_response
      await this.prisma.candidate.update({
        where: { id: candidateId },
        data: { status: 'no_response' }
      });

      // Optionally, we could also explicitly expire the token, 
      // but the TTL check already handles this at 5 days.
      console.log(`Candidate ${candidateId} marked as no_response due to inactivity.`);
    }
  }
}
