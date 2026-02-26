// src/modules/work-orders/work-orders.controller.ts
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
  Request,
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
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Guard එක Import කරමු

@ApiTags('Work Orders')
@ApiBearerAuth() // Swagger එකට කියනවා මෙතනට Token එක ඕනේ කියලා
@UseGuards(JwtAuthGuard) // මේ මුළු Controller එකම දැන් ආරක්ෂිතයි!
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Work order successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token required' })
  create(
    @Body() createWorkOrderDto: CreateWorkOrderDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.create(tenantId, createWorkOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all work orders for a tenant (Role-Based)' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
  })
  @ApiResponse({ status: 200, description: 'List of work orders retrieved' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Request() req?: any,
  ) {
    // Extract user info from JWT for RBAC
    const userId = req?.user?.sub;
    const role = req?.user?.role;

    if (status) return this.workOrdersService.findByStatus(tenantId, status);
    if (priority) return this.workOrdersService.findByPriority(tenantId, priority);
    
    return this.workOrdersService.findAll(tenantId, userId, role);
  }

  @Get('overdue/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all overdue work orders (SLA breached)' })
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for data isolation',
    required: true,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of overdue work orders (dueDate < now and status != COMPLETED)' 
  })
  findOverdue(
    @Headers('x-tenant-id') tenantId: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.sub;
    const role = req?.user?.role;
    return this.workOrdersService.findOverdue(tenantId, role, userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific work order by ID' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Work order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a work order' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Work order successfully updated' })
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, tenantId, updateWorkOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a work order' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Work order successfully deleted' })
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.workOrdersService.remove(id, tenantId);
  }

  // ===== PARTS MANAGEMENT ENDPOINTS =====

  @Post(':id/parts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a part to a work order (deducts stock)' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 201, description: 'Part added and stock deducted' })
  addPart(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() addPartDto: AddWorkOrderPartDto,
  ) {
    return this.workOrdersService.addPart(id, tenantId, addPartDto);
  }

  @Get(':id/parts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all parts used in a work order' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Parts list retrieved' })
  getWorkOrderParts(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.getWorkOrderParts(id, tenantId);
  }

  @Delete(':id/parts/:partId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a part from work order (restores stock)',
  })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiParam({ name: 'partId', description: 'Work Order Part UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Part removed and stock restored' })
  removePart(
    @Param('id') id: string,
    @Param('partId') partId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.removePart(id, partId, tenantId);
  }

  @Post(':id/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    })
  )
  @ApiOperation({ summary: 'Upload an attachment to a work order' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB, supported: jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fileName: { type: 'string' },
        fileUrl: { type: 'string' },
        fileSize: { type: 'number' },
        mimeType: { type: 'string' },
        uploadedBy: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  uploadAttachment(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ 
            maxSize: 10 * 1024 * 1024, // 10MB
            message: 'File size must not exceed 10MB'
          }),
          new FileTypeValidator({
            // Updated regex to match MIME types correctly
            fileType: /(image\/jpeg|image\/jpg|image\/png|image\/gif|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/,
          }),
        ],
        fileIsRequired: true,
        exceptionFactory: (errors) => {
          console.error('File validation failed:', errors);
          return new BadRequestException(
            `File validation failed: ${errors}. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX (Max 10MB)`
          );
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req?.user?.sub;
    return this.workOrdersService.addAttachment(id, tenantId, file, userId);
  }

  @Get(':id/attachments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all attachments for a work order' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Attachments retrieved' })
  getAttachments(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.getAttachments(id, tenantId);
  }

  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attachment from a work order' })
  @ApiParam({ name: 'id', description: 'Work Order UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.workOrdersService.deleteAttachment(attachmentId, id, tenantId);
  }
}
