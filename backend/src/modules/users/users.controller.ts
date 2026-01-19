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
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user within a tenant
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  create(
    @Headers('x-tenant-id') tenantId: string, 
    @Body() createUserDto: CreateUserDto
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return this.usersService.create(tenantId, createUserDto);
  }

  /**
   * Get all users for the specific tenant
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users for a tenant' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return this.usersService.findAll(tenantId);
  }

  /**
   * Get a specific user by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(
    @Param('id') id: string, 
    @Headers('x-tenant-id') tenantId: string
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return this.usersService.findOne(id, tenantId);
  }

  /**
   * Update a user's details
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return this.usersService.update(id, tenantId, updateUserDto);
  }

  /**
   * Delete a user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  remove(
    @Param('id') id: string, 
    @Headers('x-tenant-id') tenantId: string
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return this.usersService.remove(id, tenantId);
  }
}