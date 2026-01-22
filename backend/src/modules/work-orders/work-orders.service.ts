import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to include relations in queries
   * This ensures Asset and Technician info is always returned
   */
  private readonly includeRelations = {
    asset: true,
    assignedTo: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
  };

  /**
   * Create a new work order
   * Validates that the asset belongs to the same tenant.
   */
  async create(tenantId: string, dto: CreateWorkOrderDto) {
    // 1. Verify that the asset exists and belongs to the same tenant
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: dto.assetId,
        tenantId: tenantId,
      },
    });

    if (!asset) {
      throw new BadRequestException(
        `Asset with ID ${dto.assetId} not found in your organization`,
      );
    }

    // 2. Create the work order
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        assetId: dto.assetId,
        tenantId: tenantId,
        assignedToId: dto.assignedToId, // Mapping the technician ID
      },
      include: this.includeRelations, // Now including both Asset and Technician
    });
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
   */
  async update(id: string, tenantId: string, dto: UpdateWorkOrderDto) {
    // Check if it exists in this tenant first
    await this.findOne(id, tenantId);

    return this.prisma.workOrder.update({
      where: { id },
      data: dto,
      include: this.includeRelations, // Updated to include Technician
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
}