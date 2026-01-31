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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController { // Ensure 'export' keyword is present
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  create(
    @Body() createAssetDto: CreateAssetDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.assetsService.create({
      ...createAssetDto,
      tenantId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all assets for a tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    if (status) return this.assetsService.findByStatus(tenantId, status);
    if (category) return this.assetsService.findByCategory(tenantId, category);
    return this.assetsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset details by ID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.assetsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing asset' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, tenantId, updateAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.assetsService.remove(id, tenantId);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk import assets from Excel/CSV' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  bulkCreate(
    @Body() assets: CreateAssetDto[],
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.assetsService.createBulk(tenantId, assets);
  }

  @Delete('bulk/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all assets for a tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  removeAll(@Headers('x-tenant-id') tenantId: string) {
    return this.assetsService.removeAll(tenantId);
  }
}