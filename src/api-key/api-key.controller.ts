import { Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiKey } from './entities/api-key.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('api-key')
@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Patch()
  @ApiOkResponse({
    type: ApiKey,
    description: 'Upsert API key',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async upsertApiKey(@Request() req) {
    return await this.apiKeyService.upsertApiKey(req.user.id);
  }

  @Get()
  @ApiOkResponse({
    type: ApiKey,
    description: 'Find API key by admin ID',
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async findByAdminId(@Request() req) {
    return await this.apiKeyService.findByAdminId(req.user.id);
  }
}
