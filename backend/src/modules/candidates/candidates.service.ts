import { Injectable, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: CreateCandidateDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('At least email or phone must be provided');
    }

    // 1. Blacklist Check
    const blacklist = await this.prisma.blacklistEntry.findFirst({
      where: {
        OR: [
          { email: dto.email || undefined },
          { phone: dto.phone || undefined },
        ],
      },
    });

    if (blacklist) {
      throw new ForbiddenException('Candidate is blacklisted');
    }

    // 2. Duplicate Detection
    const duplicate = await this.prisma.candidate.findFirst({
      where: {
        OR: [
          { email: dto.email || undefined },
          { phone: dto.phone || undefined },
        ],
      },
    });

    if (duplicate) {
      throw new ConflictException('Duplicate candidate detected');
    }

    // 3. Normalization and Persistence
    const candidate = await this.prisma.candidate.create({
      data: {
        full_name: dto.fullName,
        email: dto.email ? dto.email.toLowerCase().trim() : null,
        phone: dto.phone ? dto.phone.replace(/[^0-9+]/g, '') : null,
        status: 'received', // Matches db constraint
      },
    });

    return candidate;
  }
}
