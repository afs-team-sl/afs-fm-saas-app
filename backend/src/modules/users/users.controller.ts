// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user within a tenant
   * NOTE: SUPER_ADMIN users cannot create users (they have no tenantId)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid tenant or SUPER_ADMIN cannot create users' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  create(
    @Request() req,
    @Body() createUserDto: CreateUserDto
  ) {
    const tenantId = req.user.tenantId; // From JWT payload
    const role = req.user.role;

    // SUPER_ADMIN cannot create users (no tenantId)
    if (role === 'SUPER_ADMIN' || !tenantId) {
      throw new BadRequestException('SUPER_ADMIN users cannot create organization users. Please use an organization admin account.');
    }

    return this.usersService.create(tenantId, createUserDto);
  }

  /**
   * Get all users
   * - SUPER_ADMIN: Returns ALL users across all tenants
   * - Regular users: Returns only users in their organization
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (scoped by role)' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  findAll(@Request() req) {
    const tenantId = req.user.tenantId; // Can be null for SUPER_ADMIN
    const role = req.user.role;

    console.log('📋 GET /users - User Context:');
    console.log('   Role:', role);
    console.log('   Tenant ID:', tenantId || 'null (SUPER_ADMIN)');

    return this.usersService.findAll(tenantId, role);
  }

  /**
   * Get a specific user by ID
   * - SUPER_ADMIN: Can view any user
   * - Regular users: Can only view users in their organization
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id') id: string,
    @Request() req
  ) {
    const tenantId = req.user.tenantId; // Can be null for SUPER_ADMIN
    const role = req.user.role;

    return this.usersService.findOne(id, tenantId, role);
  }

  /**
   * Update a user's details
   * NOTE: SUPER_ADMIN cannot update users (they have no organizational context)
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 400, description: 'SUPER_ADMIN cannot update organization users' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const tenantId = req.user.tenantId;
    const role = req.user.role;

    if (role === 'SUPER_ADMIN' || !tenantId) {
      throw new BadRequestException('SUPER_ADMIN users cannot update organization users. Please use an organization admin account.');
    }

    return this.usersService.update(id, tenantId, role, updateUserDto);
  }

  /**
   * Delete a user
   * NOTE: SUPER_ADMIN cannot delete users (they have no organizational context)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 400, description: 'SUPER_ADMIN cannot delete organization users' })
  remove(
    @Param('id') id: string,
    @Request() req
  ) {
    const tenantId = req.user.tenantId;
    const role = req.user.role;

    if (role === 'SUPER_ADMIN' || !tenantId) {
      throw new BadRequestException('SUPER_ADMIN users cannot delete organization users. Please use an organization admin account.');
    }

    return this.usersService.remove(id, tenantId, role);
  }
}