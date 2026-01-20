import { Controller, Get, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tenants (Super Admin Only)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // අපේ Main Company (Alpha Industries) ID එක 🛡️
  private readonly SUPER_TENANT_ID = '2411cbe9-483d-4f63-87ef-53aa591529a8';

  @Get()
  @ApiOperation({ summary: 'Get all registered organizations (Internal Use Only)' })
  @ApiResponse({ status: 200, description: 'List of all tenants retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async findAll(@Request() req) {
    // JWT එකෙන් එන user ගේ tenantId එක අපේ Main ID එකට සමානද කියලා බලනවා
    if (req.user.tenantId !== this.SUPER_TENANT_ID) {
      throw new ForbiddenException(
        'Access Denied: Your organization does not have permission to view global data.'
      );
    }
    
    return this.tenantsService.findAll();
  }
}