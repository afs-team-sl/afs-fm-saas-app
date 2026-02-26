import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AddWorkOrderPartDto } from '../parts/dto/add-work-order-part.dto';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';
import { StorageService } from '../shared/storage/storage.service';

@Injectable()
export class WorkOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Helper to include relations in queries
   * This ensures Asset and Technician info is always returned
   */
  private readonly includeRelations = {
    asset: {
      include: {
        room: {
          include: {
            floor: {
              include: {
                building: true,
              },
            },
          },
        },
      },
    },
    assignedTo: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    parts: {
      include: {
        part: true,
      },
    },
  };

  /**
   * Create bulk work orders (one per asset)
   * Validates that all assets belong to the same tenant.
   */
  async create(tenantId: string, dto: CreateWorkOrderDto) {
    // 1. Verify that all assets exist and belong to the same tenant
    const assets = await this.prisma.asset.findMany({
      where: {
        id: { in: dto.assetIds },
        tenantId: tenantId,
      },
    });

    if (assets.length !== dto.assetIds.length) {
      const foundIds = assets.map((a) => a.id);
      const missingIds = dto.assetIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `The following asset IDs were not found in your organization: ${missingIds.join(', ')}`,
      );
    }

    // 2. Create one work order per asset using a transaction
    return this.prisma.$transaction(
      dto.assetIds.map((assetId) =>
        this.prisma.workOrder.create({
          data: {
            title: dto.title,
            description: dto.description,
            priority: dto.priority,
            assetId: assetId,
            tenantId: tenantId,
            assignedToId: dto.assignedToId,
            checklistData: dto.checklistData,
            legacyId: dto.legacyId,
          },
          include: this.includeRelations,
        }),
      ),
    );
  }

  /**
   * Find all work orders for a specific tenant (with RBAC)
   * - TECHNICIAN: Only sees orders assigned to them
   * - ADMIN/MANAGER: Sees all tenant work orders
   */
  async findAll(tenantId: string, userId?: string, role?: string) {
    // Build the where clause based on role
    const whereClause: any = { tenantId };

    // If user is a TECHNICIAN, filter by assignedToId
    if (role === 'TECHNICIAN' && userId) {
      whereClause.assignedToId = userId;
    }

    return this.prisma.workOrder.findMany({
      where: whereClause,
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find work orders by status
   */
  async findByStatus(tenantId: string, status: string) {
    return this.prisma.workOrder.findMany({
      where: { 
        tenantId, 
        status: status as WorkOrderStatus 
      },
      include: this.includeRelations, // Updated to include Technician
    });
  }

  /**
   * Find work orders by priority
   */
  async findByPriority(tenantId: string, priority: string) {
    return this.prisma.workOrder.findMany({
      where: { 
        tenantId, 
        priority: priority as WorkOrderPriority 
      },
      include: this.includeRelations, // Updated to include Technician
    });
  }

  /**
   * Find a specific work order by ID
   */
  async findOne(id: string, tenantId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id, tenantId },
      include: this.includeRelations, // Updated to include Technician
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  /**
   * Update a work order
   * CRITICAL: 
   * - When status changes to 'IN_PROGRESS', auto-set startedAt to current time
   * - When status changes to 'COMPLETED', auto-calculate laborHours and deduct stock
   */
  async update(id: string, tenantId: string, dto: UpdateWorkOrderDto) {
    // Check if it exists in this tenant first
    const existingWorkOrder = await this.findOne(id, tenantId);

    // Auto-set startedAt when status changes to IN_PROGRESS
    const isStarting = dto.status === 'IN_PROGRESS' && existingWorkOrder.status !== 'IN_PROGRESS';
    if (isStarting && !dto.startedAt) {
      dto.startedAt = new Date().toISOString();
    }

    // Auto-calculate laborHours when status changes to COMPLETED
    const isBeingCompleted = dto.status === 'COMPLETED' && existingWorkOrder.status !== 'COMPLETED';
    if (isBeingCompleted) {
      // Calculate labor hours if startedAt exists
      const startTime = existingWorkOrder.startedAt || new Date();
      const endTime = new Date();
      const diffMs = endTime.getTime() - new Date(startTime).getTime();
      const hours = diffMs / (1000 * 60 * 60);
      dto.laborHours = parseFloat(hours.toFixed(2)); // Round to 2 decimal places
    }

    if (isBeingCompleted) {
      // Use transaction to ensure atomicity
      return this.prisma.$transaction(async (tx) => {
        // 1. Get all parts linked to this work order
        const workOrderParts = await tx.workOrderPart.findMany({
          where: { workOrderId: id },
          include: { part: true },
        });

        // 2. Deduct stock for each part
        for (const woPart of workOrderParts) {
          // Verify sufficient stock
          if (woPart.part.stockLevel < woPart.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${woPart.part.name}. Available: ${woPart.part.stockLevel}, Required: ${woPart.quantity}`,
            );
          }

          // Deduct stock
          await tx.part.update({
            where: { id: woPart.partId },
            data: {
              stockLevel: {
                decrement: woPart.quantity,
              },
            },
          });
        }

        // 3. Update the work order with labor tracking data
        return tx.workOrder.update({
          where: { id },
          data: {
            ...dto,
            startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          },
          include: this.includeRelations,
        });
      });
    }

    // If not being completed, just update normally (with labor tracking fields)
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: this.includeRelations,
    });
  }

  /**
   * Delete a work order
   */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.workOrder.delete({
      where: { id },
    });

    return { message: 'Work order deleted successfully' };
  }

  /**
   * Find all overdue work orders (SLA breached)
   * Returns work orders where dueDate < now AND status is not COMPLETED
   */
  async findOverdue(tenantId: string, role?: string, userId?: string) {
    const now = new Date();
    
    const whereClause: any = {
      tenantId,
      dueDate: {
        lt: now, // Less than current time
      },
      status: {
        not: 'COMPLETED', // Exclude completed orders
      },
    };

    // If technician, show only their assigned tasks
    if (role === 'TECHNICIAN' && userId) {
      whereClause.assignedToId = userId;
    }

    return this.prisma.workOrder.findMany({
      where: whereClause,
      include: this.includeRelations,
      orderBy: { dueDate: 'asc' }, // Most overdue first
    });
  }

  /**
   * Add a part to a work order (Soft Link - No immediate stock deduction)
   * Stock will only be deducted when Work Order status changes to 'COMPLETED'
   */
  async addPart(
    workOrderId: string,
    tenantId: string,
    dto: AddWorkOrderPartDto,
  ) {
    // 1. Verify work order exists and belongs to tenant
    const workOrder = await this.findOne(workOrderId, tenantId);

    // 2. Prevent adding parts to completed or cancelled work orders
    if (workOrder.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot add parts to a completed work order',
      );
    }

    if (workOrder.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cannot add parts to a cancelled work order',
      );
    }

    // 3. Verify the part exists and belongs to the same tenant
    const part = await this.prisma.part.findFirst({
      where: {
        id: dto.partId,
        tenantId: tenantId,
      },
    });

    if (!part) {
      throw new NotFoundException(
        `Part with ID ${dto.partId} not found in your organization`,
      );
    }

    // 4. Validate that sufficient stock will be available when completed
    // This is a soft validation - actual deduction happens on completion
    if (part.stockLevel < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${part.name}. Available: ${part.stockLevel}, Required: ${dto.quantity}. Stock will be deducted when work order is completed.`,
      );
    }

    // 5. Create the WorkOrderPart record (Soft Link)
    const workOrderPart = await this.prisma.workOrderPart.create({
      data: {
        workOrderId: workOrderId,
        partId: dto.partId,
        quantity: dto.quantity,
      },
      include: {
        part: true,
      },
    });

    return workOrderPart;
  }

  /**
   * Get all parts used in a specific work order
   */
  async getWorkOrderParts(workOrderId: string, tenantId: string) {
    await this.findOne(workOrderId, tenantId);

    return this.prisma.workOrderPart.findMany({
      where: { workOrderId },
      include: {
        part: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Remove a part from a work order
   * Since stock is only deducted on completion, no stock restoration needed
   */
  async removePart(
    workOrderId: string,
    workOrderPartId: string,
    tenantId: string,
  ) {
    // Verify work order exists
    const workOrder = await this.findOne(workOrderId, tenantId);

    // Prevent removing parts from completed work orders
    if (workOrder.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot remove parts from a completed work order. Stock has already been deducted.',
      );
    }

    // Find the work order part
    const workOrderPart = await this.prisma.workOrderPart.findUnique({
      where: { id: workOrderPartId },
      include: { part: true },
    });

    if (!workOrderPart || workOrderPart.workOrderId !== workOrderId) {
      throw new NotFoundException('Work order part not found');
    }

    // Delete the work order part (no stock restoration needed)
    await this.prisma.workOrderPart.delete({
      where: { id: workOrderPartId },
    });

    return { message: 'Part removed from work order' };
  }

  /**
   * Add an attachment to a work order
   * @param workOrderId - Work Order UUID
   * @param tenantId - Tenant ID for validation
   * @param file - Uploaded file from multer
   * @param uploadedBy - User ID who uploaded the file (optional)
   */
  async addAttachment(
    workOrderId: string,
    tenantId: string,
    file: Express.Multer.File,
    uploadedBy?: string,
  ) {
    // 1. Verify work order exists and belongs to tenant
    const workOrder = await this.findOne(workOrderId, tenantId);

    if (!workOrder) {
      throw new NotFoundException(
        `Work order with ID ${workOrderId} not found`,
      );
    }

    // 2. Upload file to Azure Blob Storage
    const fileUrl = await this.storageService.uploadFile(
      file,
      'work-order-evidence',
    );

    // 3. Create attachment record in database
    const attachment = await this.prisma.workOrderAttachment.create({
      data: {
        workOrderId,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      },
    });

    return attachment;
  }

  /**
   * Get all attachments for a work order
   */
  async getAttachments(workOrderId: string, tenantId: string) {
    // Verify work order exists and belongs to tenant
    await this.findOne(workOrderId, tenantId);

    return this.prisma.workOrderAttachment.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an attachment from a work order
   */
  async deleteAttachment(
    attachmentId: string,
    workOrderId: string,
    tenantId: string,
  ) {
    // 1. Verify work order exists and belongs to tenant
    await this.findOne(workOrderId, tenantId);

    // 2. Find the attachment
    const attachment = await this.prisma.workOrderAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.workOrderId !== workOrderId) {
      throw new NotFoundException('Attachment not found');
    }

    // 3. Delete from Azure Blob Storage
    await this.storageService.deleteFile(
      attachment.fileUrl,
      'work-order-evidence',
    );

    // 4. Delete database record
    await this.prisma.workOrderAttachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment deleted successfully' };
  }
}
