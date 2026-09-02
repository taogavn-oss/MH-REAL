import { Controller, Post, Body, UseGuards, Request, Param, Delete, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SlotsService } from './slots.service.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';

@ApiTags('Slots')
@Controller()
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get('stores/:storeId/slots')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'List open/booked slots of a Store (API-006)' })
  async getStoreSlots(@Param('storeId') storeId: string, @Query('date') date: string) {
    // Stub for API-006
    return { storeId, date, slots: [] };
  }

  @Post('slots/:id/book')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SM', 'SUB_SM', 'HQ')
  @ApiOperation({ summary: 'Book candidate by transaction (API-007)' })
  async bookSlot(@Param('id') id: string, @Body() dto: any) {
    // Stub for API-007
    return { id, success: true, message: 'Booked' };
  }

  /*
  // Disabled as per SRC-ROUTE-C-01 - not in approved OpenAPI registry
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SM')
  @ApiOperation({ summary: 'Create Interview Slot (SM only)' })
  async createSlot(@Request() req: any, @Body() dto: CreateSlotDto) {
    return this.slotsService.createSlot(req.user.userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SM')
  @ApiOperation({ summary: 'Cancel Interview Slot (SM only)' })
  async cancelSlot(@Request() req: any, @Param('id') id: string) {
    return this.slotsService.cancelSlot(req.user.userId, id);
  }

  @Get('timeline')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HQ')
  @ApiOperation({ summary: 'HQ Timeline for Interview Slots' })
  async getTimeline(@Query() query: any) {
    return this.slotsService.getTimeline(query);
  }
  */
}
