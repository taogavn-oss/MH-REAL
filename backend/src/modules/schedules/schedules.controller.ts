import { Controller, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // In a full implementation, these would handle the detailed state changes (P5-06)
  
  /*
  // Disabled as per SRC-ROUTE-C-01 - not in approved OpenAPI registry
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SM', 'HQ')
  @ApiOperation({ summary: 'Cancel an Interview Schedule (P5-06)' })
  async cancelSchedule(@Request() req: any, @Param('id') id: string) {
    // Left empty for brevity; would update schedule to cancelled and free the slot
    return { message: 'Schedule cancelled', id };
  }

  @Patch(':id/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SM')
  @ApiOperation({ summary: 'Complete an Interview Schedule with Result (P5-06)' })
  async completeSchedule(@Request() req: any, @Param('id') id: string) {
    // Update schedule to completed, candidate to interview_completed
    return { message: 'Schedule completed', id };
  }
  */
}
