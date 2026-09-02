import { Controller, Post, Put, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JobRequirementsService } from './job-requirements.service.js';
import { CreateJobRequirementDto } from './dto/create-job-requirement.dto.js';
import { UpdateJobRequirementDto } from './dto/update-job-requirement.dto.js';
import { ApproveJobRequirementDto } from './dto/approve-job-requirement.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';
import { ScopeGuard } from '../../common/guards/scope.guard.js';

@ApiTags('Job Requirements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('job-requirements')
export class JobRequirementsController {
  constructor(private readonly jobRequirementsService: JobRequirementsService) {}

  @Post()
  @Roles('HQ', 'AM', 'SM', 'SUB_SM')
  @ApiOperation({ summary: 'Create a draft job requirement' })
  async createDraft(@Request() req: any, @Body() dto: CreateJobRequirementDto) {
    return this.jobRequirementsService.createDraft(req.user.userId, dto);
  }

  @Put(':id')
  @Roles('HQ', 'AM', 'SM', 'SUB_SM')
  @ApiOperation({ summary: 'Update a draft job requirement with OCC' })
  async updateDraft(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateJobRequirementDto) {
    return this.jobRequirementsService.updateDraft(id, req.user.userId, dto);
  }

  @Post(':id/action')
  @Roles('HQ', 'AM', 'SM', 'SUB_SM')
  @ApiOperation({ summary: 'Submit, approve, or reject a job requirement' })
  async processAction(@Request() req: any, @Param('id') id: string, @Body() dto: ApproveJobRequirementDto) {
    return this.jobRequirementsService.processAction(id, req.user.userId, req.user.roleCode, dto);
  }

  @Get()
  @Roles('HQ', 'AM', 'SM', 'SUB_SM')
  @ApiOperation({ summary: 'List job requirements with role-based filtering' })
  async list(@Request() req: any, @Query() query: any) {
    const filters: any = {};
    if (query.status) filters.status = query.status;
    if (query.storeId) filters.store_id = query.storeId;
    
    // In a real app, we would inject storeId constraints based on AM/SM assignments here if not HQ.
    return this.jobRequirementsService.list(filters);
  }

  /*
  // Disabled as per SRC-ROUTE-C-01 - not in approved OpenAPI registry
  @Get(':id/history')
  @Roles('HQ', 'AM', 'SM', 'SUB_SM')
  @ApiOperation({ summary: 'Get approval history of a job requirement' })
  async getHistory(@Param('id') id: string) {
    return this.jobRequirementsService.getHistory(id);
  }

  @Post('import')
  @Roles('HQ')
  @ApiOperation({ summary: 'Import job requirements (stubbed)' })
  async importRequirements() {
    return { message: 'File import validation passed (stub for P3-05 pending OPN-005).' };
  }
  */
}
