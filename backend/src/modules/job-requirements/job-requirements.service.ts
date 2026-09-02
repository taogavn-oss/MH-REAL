import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateJobRequirementDto, RequirementChannel } from './dto/create-job-requirement.dto.js';
import { UpdateJobRequirementDto } from './dto/update-job-requirement.dto.js';
import { ApproveJobRequirementDto, ApprovalActionEnum } from './dto/approve-job-requirement.dto.js';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class JobRequirementsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(userId: string, dto: CreateJobRequirementDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.jobRequirement.findUnique({
        where: { store_id_channel: { store_id: dto.storeId, channel: dto.channel } },
      });
      if (existing) {
        throw new ConflictException('Job requirement for this store and channel already exists');
      }

      const requirement = await tx.jobRequirement.create({
        data: {
          store_id: dto.storeId,
          channel: dto.channel,
          status: 'draft',
          created_by: userId,
          updated_by: userId,
        },
      });

      const version = await tx.jobRequirementVersion.create({
        data: {
          job_requirement_id: requirement.id,
          version_no: 1,
          payload: dto.payload,
        },
      });

      await tx.jobRequirement.update({
        where: { id: requirement.id },
        data: { current_version_id: version.id },
      });

      return { requirement, version };
    });
  }

  async updateDraft(id: string, userId: string, dto: UpdateJobRequirementDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const requirement = await tx.jobRequirement.findUnique({
        where: { id },
        include: { versions: { orderBy: { version_no: 'desc' }, take: 1 } },
      });

      if (!requirement || requirement.versions.length === 0) {
        throw new NotFoundException('Job requirement not found');
      }

      if (requirement.status !== 'draft' && requirement.status !== 'rejected') {
        throw new ForbiddenException('Cannot edit a requirement that is currently under review or approved');
      }

      const currentVersion = requirement.versions[0];
      if (currentVersion.version_no !== dto.versionNo) {
        throw new ConflictException('Optimistic locking failure: Stale version');
      }

      const newVersionNo = currentVersion.version_no + 1;

      const version = await tx.jobRequirementVersion.create({
        data: {
          job_requirement_id: requirement.id,
          version_no: newVersionNo,
          payload: dto.payload,
        },
      });

      const updatedReq = await tx.jobRequirement.update({
        where: { id: requirement.id },
        data: { 
          current_version_id: version.id,
          status: 'draft', // editing a rejected req moves it back to draft
          updated_by: userId 
        },
      });

      return { requirement: updatedReq, version };
    });
  }

  async processAction(id: string, userId: string, userRole: string, dto: ApproveJobRequirementDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const requirement = await tx.jobRequirement.findUnique({
        where: { id },
        include: { versions: { orderBy: { version_no: 'desc' }, take: 1 } },
      });

      if (!requirement || requirement.versions.length === 0) {
        throw new NotFoundException('Job requirement not found');
      }

      const currentVersion = requirement.versions[0];
      if (currentVersion.version_no !== dto.versionNo) {
        throw new ConflictException('Optimistic locking failure: Stale version');
      }

      let newStatus: any;

      if (dto.action === ApprovalActionEnum.submit) {
        if (requirement.status !== 'draft') throw new BadRequestException('Only drafts can be submitted');
        newStatus = 'pending_am';
        
        await tx.jobRequirementVersion.update({
          where: { id: currentVersion.id },
          data: { submitted_by: userId, submitted_at: new Date() }
        });
      } else if (dto.action === ApprovalActionEnum.approve) {
        if (userRole === 'AM' && requirement.status === 'pending_am') {
          newStatus = 'pending_hq';
        } else if (userRole === 'HQ' && requirement.status === 'pending_hq') {
          newStatus = 'approved_hq';
        } else {
          throw new ForbiddenException('Invalid role for this approval step');
        }
      } else if (dto.action === ApprovalActionEnum.reject) {
        if (!dto.comment) throw new BadRequestException('Comment is required for rejection');
        newStatus = 'rejected';
      }

      const updatedReq = await tx.jobRequirement.update({
        where: { id: requirement.id },
        data: { 
          status: newStatus,
          published_version_id: newStatus === 'approved_hq' ? currentVersion.id : requirement.published_version_id,
          updated_by: userId 
        },
      });

      const actionLog = await tx.approvalAction.create({
        data: {
          job_requirement_version_id: currentVersion.id,
          actor_id: userId,
          action: dto.action,
          comment: dto.comment,
        }
      });

      return { requirement: updatedReq, actionLog };
    });
  }

  async list(filters: any) {
    return this.prisma.jobRequirement.findMany({
      where: filters,
      include: {
        store: true,
      }
    });
  }

  async getHistory(id: string) {
    const requirement = await this.prisma.jobRequirement.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            approval_actions: {
              include: { actor: { select: { full_name: true, role: true } } },
              orderBy: { created_at: 'asc' }
            }
          },
          orderBy: { version_no: 'asc' }
        }
      }
    });
    if (!requirement) throw new NotFoundException('Job requirement not found');
    return requirement.versions;
  }
}
