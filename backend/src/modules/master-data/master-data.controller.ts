import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Post('import')
  @Roles('HQ')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import master data (stubbed)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['area', 'store', 'sm', 'sub_sm', 'am'],
        },
      },
    },
  })
  async importData(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Stub implementation pending file format resolution (OPN-005, OPN-006)
    return {
      message: 'File import validation passed (stub).',
      filename: file.originalname,
      status: 'pending_logic',
    };
  }
}
