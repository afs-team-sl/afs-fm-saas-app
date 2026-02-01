import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings (Super Admin only)' })
  getSettings() {
    return this.systemService.getSettings();
  }

  @Post('maintenance-mode')
  @ApiOperation({ summary: 'Toggle maintenance mode (Super Admin only)' })
  toggleMaintenanceMode(
    @Body() data: { enabled: boolean; message?: string }
  ) {
    return this.systemService.toggleMaintenanceMode(data.enabled, data.message);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get global audit logs (Super Admin only)' })
  getAuditLogs() {
    return this.systemService.getAuditLogs();
  }
}
