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
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Express } from 'express';

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

  @Get('locations')
  @ApiOperation({ summary: 'Get unique location strings from assets' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  findUniqueLocations(@Headers('x-tenant-id') tenantId: string) {
    return this.assetsService.getUniqueLocations(tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all assets for a tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'location', required: false })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('roomId') roomId?: string,
    @Query('location') location?: string,
  ) {
    if (status) return this.assetsService.findByStatus(tenantId, status);
    if (category) return this.assetsService.findByCategory(tenantId, category);
    if (roomId) return this.assetsService.findByRoom(tenantId, roomId);
    if (location) return this.assetsService.findByLocation(tenantId, location);
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
  remove(
    @Param('id') id: string, 
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: any
  ) {
    const userEmail = req.user?.email || 'Unknown';
    return this.assetsService.remove(id, tenantId, userEmail);
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

  // ============================================================
  // PHASE 6 FINAL: ASSET IMAGE & DOCUMENT UPLOADS
  // ============================================================

  @Post(':id/image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for images
      },
    })
  )
  @ApiOperation({ summary: 'Upload asset profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Asset UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (max 5MB, supported: jpg, jpeg, png)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', example: 'https://storage.azure.com/...' },
      },
    },
  })
  async uploadImage(
    @Param('id') assetId: string,
    @Headers('x-tenant-id') tenantId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 5 * 1024 * 1024, // 5MB for images
          }),
          new FileTypeValidator({
            fileType: '.(jpg|jpeg|png)$',
          }),
        ],
        fileIsRequired: true,
      })
    )
    file: Express.Multer.File,
  ) {
    // Additional MIME type validation
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid image type: ${file.mimetype}. Allowed types: JPG, PNG`
      );
    }

    const imageUrl = await this.assetsService.uploadImage(assetId, tenantId, file);
    return { imageUrl };
  }

  @Post(':id/documents')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
      },
    })
  )
  @ApiOperation({ summary: 'Upload asset document (manual, datasheet, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Asset UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (max 10MB, supported: pdf, doc, docx, xls, xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  async uploadDocument(
    @Param('id') assetId: string,
    @Headers('x-tenant-id') tenantId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 10 * 1024 * 1024, // 10MB
          }),
          new FileTypeValidator({
            fileType: '.(pdf|doc|docx|xls|xlsx)$',
          }),
        ],
        fileIsRequired: true,
      })
    )
    file: Express.Multer.File,
  ) {
    // Additional MIME type validation
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid document type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, XLS, XLSX`
      );
    }

    return this.assetsService.uploadDocument(assetId, tenantId, file);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get all documents for an asset' })
  @ApiParam({ name: 'id', description: 'Asset UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  getDocuments(
    @Param('id') assetId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.assetsService.getDocuments(assetId, tenantId);
  }

  @Delete(':id/documents/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an asset document' })
  @ApiParam({ name: 'id', description: 'Asset UUID' })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  deleteDocument(
    @Param('id') assetId: string,
    @Param('documentId') documentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.assetsService.deleteDocument(assetId, documentId, tenantId);
  }
}