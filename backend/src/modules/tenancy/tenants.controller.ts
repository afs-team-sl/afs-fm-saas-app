import { Controller, Get, Patch, Body, UseGuards, ForbiddenException, Request, Param, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '@prisma/client';

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
    description: 'The broadcast message to send to all users',
    example: 'System maintenance scheduled for tomorrow at 2 AM EST',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'INFO',
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
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
  @ApiOperation({ summary: 'Get all registered organizations (Internal Use Only)' })
  @ApiResponse({ status: 200, description: 'List of all tenants retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async findAll(@Request() req) {
    // 1. Env එකෙන් ID එක ගන්නවා. නැත්නම් Backup එක විදියට ඔයාගේ Master ID එක පාවිච්චි කරනවා.
    const masterSuperId = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';
    
    // 2. දැනට ලොග් වෙලා ඉන්න යූසර්ගේ Tenant ID එක (JWT එකෙන් එන එක)
    const currentUserTenantId = req.user.tenantId;

    // --- DEBUGGING (VS Code Terminal එකේ බලන්න) ---
    console.log('-------------------------------------------');
    console.log('🛡️  SUPER ADMIN SECURITY CHECK');
    console.log('Logged User Tenant ID:', currentUserTenantId);
    console.log('System Required ID:   ', masterSuperId);
    
    // 3. හරියටම සමානද බලනවා. (Spaces තිබුණොත් අයින් වෙන්න .trim() දාමු)
    if (currentUserTenantId?.trim() !== masterSuperId?.trim()) {
      console.log('❌ ACCESS DENIED: ID MISMATCH');
      throw new ForbiddenException(
        'Access Denied: Your organization does not have permission to view global data.'
      );
    }
    
    console.log('✅ ACCESS GRANTED: WELCOME MASTER ADMIN');
    console.log('-------------------------------------------');

    return this.tenantsService.findAll();
  }

  @Get(':id/impersonate')
  @ApiOperation({ summary: 'Impersonate as tenant admin (Super Admin Only)' })
  @ApiResponse({ status: 200, description: 'JWT token for tenant admin generated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  @ApiResponse({ status: 404, description: 'Tenant or admin user not found.' })
  async impersonateTenant(@Request() req, @Param('id') tenantId: string) {
    const masterSuperId = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';
    const currentUserTenantId = req.user.tenantId;

    console.log('🎭 IMPERSONATION REQUEST');
    console.log('Requester Tenant ID:', currentUserTenantId);
    console.log('Target Tenant ID:', tenantId);

    if (currentUserTenantId?.trim() !== masterSuperId?.trim()) {
      console.log('❌ IMPERSONATION DENIED: NOT SUPER ADMIN');
      throw new ForbiddenException(
        'Access Denied: Only Super Admin can impersonate other tenants.'
      );
    }

    console.log('✅ IMPERSONATION ALLOWED');
    return this.tenantsService.generateImpersonationToken(tenantId);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Send system-wide broadcast message (Super Admin Only)' })
  @ApiResponse({ status: 201, description: 'Broadcast message sent successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You are not a Super Admin.' })
  async broadcastMessage(@Request() req, @Body() broadcastDto: BroadcastDto) {
    const masterSuperId = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';
    const currentUserTenantId = req.user.tenantId;

    console.log('📢 BROADCAST REQUEST');
    console.log('Requester Tenant ID:', currentUserTenantId);

    if (currentUserTenantId?.trim() !== masterSuperId?.trim()) {
      console.log('❌ BROADCAST DENIED: NOT SUPER ADMIN');
      throw new ForbiddenException(
        'Access Denied: Only Super Admin can send broadcast messages.'
      );
    }

    console.log('✅ BROADCAST SENDING');
    return this.tenantsService.createBroadcast(broadcastDto.message, broadcastDto.type);
  }

  @Get('notifications/active')
  @ApiOperation({ summary: 'Get active broadcast notifications for all users' })
  @ApiResponse({ status: 200, description: 'Active notifications retrieved.' })
  async getActiveNotifications() {
    return this.tenantsService.getActiveNotifications();
  }
}