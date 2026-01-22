import { Controller, Get, Patch, Body, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class UpdateTenantDto {
  @ApiProperty({
    description: 'The new name for the organization',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
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
}