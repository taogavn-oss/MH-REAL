import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TokensService } from './tokens.service.js';
import { CreateTokenDto } from './dto/create-token.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Roles } from '../../common/guards/roles.guard.js';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('generate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HQ') // HQ manually sends tokens, or webhook/internal triggers it
  @ApiOperation({ summary: 'Generate a short-lived token for a candidate' })
  async generateToken(@Body() dto: CreateTokenDto) {
    return this.tokensService.generate(dto);
  }
}
