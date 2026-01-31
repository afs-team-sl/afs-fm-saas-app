import { Controller, Get, Patch, Delete, Body, UseGuards, ForbiddenException, Request, Param, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { AnnouncementType } from '@prisma/client';

class UpdateTenantDto {
  @ApiProperty({
    description: 'The new name for the organization',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

class BroadcastDto {
  @ApiProperty({
    description: 'The announcement message',
    example: 'System maintenance scheduled for tomorrow at 2 AM EST',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of announcement',
    enum: AnnouncementType,
    example: 'INFO',
  })
  @IsEnum(AnnouncementType)
  @IsOptional()
  type?: AnnouncementType;
}

@ApiTags('Tenants (Super Admin Only)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user\'s tenant information' })
  @ApiResponse({ status: 200, description: 'Current tenant retrieved.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async getCurrentTenant(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current organization name (Admin only)' })
  @ApiResponse({ status: 200, description: 'Organization name updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only admins can update organization name.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async updateCurrentTenant(@Request() req, @Body() updateTenantDto: UpdateTenantDto) {
    // Only admins can update organization name
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can update organization settings');
    }

    const tenantId = req.user.tenantId;
    return this.tenantsService.update(tenantId, { name: updateTenantDto.name });
  }

  @Get()
  @ApiOperation({ summary: 'Get all registered organizations (Super Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of all tenants retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async findAll(@Request() req) {
    console.log('-------------------------------------------');
    console.log('🛡️  SUPER ADMIN SECURITY CHECK - findAll()');
    console.log('User Role:', req.user.role);
    console.log('User Tenant ID:', req.user.tenantId);

    // SECURITY: Only SUPER_ADMIN role can access this endpoint
    if (req.user.role !== 'SUPER_ADMIN') {
      console.log('❌ ACCESS DENIED: NOT SUPER_ADMIN ROLE');
      console.log('-------------------------------------------');
      throw new ForbiddenException(
        'Access Denied: Only Super Admins can view all organizations.'
      );
    }

    console.log('✅ ACCESS GRANTED: SUPER_ADMIN VERIFIED');
    console.log('-------------------------------------------');

    return this.tenantsService.findAll();
  }

  @Get(':id/impersonate')
  @ApiOperation({ summary: 'Impersonate as tenant admin (Super Admin Only)' })
  @ApiResponse({ status: 200, description: 'JWT token for tenant admin generated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  @ApiResponse({ status: 404, description: 'Tenant or admin user not found.' })
  async impersonateTenant(@Request() req, @Param('id') tenantId: string) {
    console.log('🎭 IMPERSONATION REQUEST');
    console.log('User Role:', req.user.role);
    console.log('Target Tenant ID:', tenantId);

    // STRICT SECURITY: Only SUPER_ADMIN role can impersonate
    if (req.user.role !== 'SUPER_ADMIN') {
      console.log('❌ IMPERSONATION DENIED: NOT SUPER_ADMIN ROLE');
      throw new ForbiddenException(
        'Access Denied: Only Super Admins can impersonate other tenants.'
      );
    }

    console.log('✅ IMPERSONATION ALLOWED');
    return this.tenantsService.generateImpersonationToken(tenantId);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Create global announcement (Super Admin Only)' })
  @ApiResponse({ status: 201, description: 'Announcement created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async broadcastMessage(@Request() req, @Body() broadcastDto: BroadcastDto) {
    console.log('📢 BROADCAST REQUEST');
    console.log('User Role:', req.user.role);

    // STRICT SECURITY: Only SUPER_ADMIN role can create global announcements
    if (req.user.role !== 'SUPER_ADMIN') {
      console.log('❌ BROADCAST DENIED: NOT SUPER_ADMIN ROLE');
      throw new ForbiddenException(
        'Access Denied: Only Super Admins can create global announcements.'
      );
    }

    console.log('✅ BROADCAST CREATING');
    return this.tenantsService.createAnnouncement(broadcastDto.message, broadcastDto.type);
  }

  @Get('active-announcements')
  @ApiOperation({ summary: 'Get all active announcements (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Active announcements retrieved.' })
  async getActiveAnnouncements(@Request() req) {
    const tenantId = req.user?.tenantId || null;
    return this.tenantsService.getActiveAnnouncements(tenantId);
  }

  @Delete('announcements/:id')
  @ApiOperation({ summary: 'Delete an announcement (Super Admin Only)' })
  @ApiResponse({ status: 200, description: 'Announcement deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async deleteAnnouncement(@Request() req, @Param('id') announcementId: string) {
    // STRICT SECURITY: Only SUPER_ADMIN role can delete announcements
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Access Denied: Only Super Admins can delete announcements.'
      );
    }

    return this.tenantsService.deleteAnnouncement(announcementId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant organization (Super Admin Only)' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async deleteTenant(@Request() req, @Param('id') tenantId: string) {
    console.log('🗑️  TENANT DELETION REQUEST');
    console.log('User Role:', req.user.role);
    console.log('Target Tenant ID:', tenantId);

    // SECURITY: Only SUPER_ADMIN role can delete tenants
    if (req.user.role !== 'SUPER_ADMIN') {
      console.log('❌ DELETION DENIED: NOT SUPER_ADMIN ROLE');
      throw new ForbiddenException(
        'Access Denied: Only Super Admins can delete tenant organizations.'
      );
    }

    console.log('✅ DELETION AUTHORIZED');
    return this.tenantsService.remove(tenantId);
  }
}