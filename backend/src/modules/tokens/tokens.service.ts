import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto.js';
import * as crypto from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class TokensService {
  constructor(@InjectQueue('inactivity') private inactivityQueue: Queue, private readonly prisma: PrismaService) { }

  async generate(dto: CreateTokenDto) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id: dto.candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    // 5 days TTL for survey tokens
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 5);

    const rawToken = crypto.randomBytes(32).toString('hex');

    // Disable previous unused tokens for this candidate
    await this.prisma.candidateSurveyToken.updateMany({
      where: { candidate_id: dto.candidateId, used_at: null },
      data: { expires_at: new Date() }, // expire them now
    });

    const token = await this.prisma.candidateSurveyToken.create({
      data: {
        candidate_id: dto.candidateId,
        token_hash: this.hashToken(rawToken),
        expires_at: expiresAt,
      }
    });

    // Schedule 5-day timeout job
    await this.inactivityQueue.add('check-response', { tokenId: token.id, candidateId: dto.candidateId }, {
      jobId: `timeout-${token.id}`,
      delay: 5 * 24 * 60 * 60 * 1000 // 5 days
    });

    return {
      tokenId: token.id,
      token: rawToken, // Return the raw token only once, to be emailed
      expiresAt,
    };
  }

  async validateAndConsume(rawToken: string, purpose: string) {
    const hash = this.hashToken(rawToken);
    const tokenRecord = await this.prisma.candidateSurveyToken.findFirst({
      where: { token_hash: hash, used_at: null },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or already used token');
    }

    if (tokenRecord.expires_at < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    // Consume
    await this.prisma.candidateSurveyToken.update({
      where: { id: tokenRecord.id },
      data: { used_at: new Date() },
    });

    // Cancel the inactivity job
    const job = await this.inactivityQueue.getJob(`timeout-${tokenRecord.id}`);
    if (job) {
      await job.remove();
    }

    return tokenRecord.candidate_id;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
