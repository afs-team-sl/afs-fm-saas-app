import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';

@Injectable()
export class MaintenancePlansService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMaintenancePlanDto, tenantId: string) {
    // Verify asset belongs to tenant
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset || asset.tenantId !== tenantId) {
      throw new ForbiddenException('Asset not found or access denied');
    }

    return this.prisma.maintenancePlan.create({
      data: {
        title: dto.title,
        description: dto.description,
        frequency: dto.frequency,
        nextDueDate: new Date(dto.nextDueDate),
        assetId: dto.assetId,
        tenantId,
      },
      include: {
        asset: { select: { id: true, name: true, category: true } },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.maintenancePlan.findMany({
      where: { tenantId },
      include: {
        asset: { select: { id: true, name: true, category: true, status: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id },
      include: {
        asset: { select: { id: true, name: true, category: true, status: true } },
      },
    });

    if (!plan) {
      throw new NotFoundException('Maintenance plan not found');
    }

    if (plan.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return plan;
  }

  async update(id: string, dto: UpdateMaintenancePlanDto, tenantId: string) {
    await this.findOne(id, tenantId); // Verify ownership

    return this.prisma.maintenancePlan.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.frequency && { frequency: dto.frequency }),
        ...(dto.nextDueDate && { nextDueDate: new Date(dto.nextDueDate) }),
      },
      include: {
        asset: { select: { id: true, name: true, category: true } },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId); // Verify ownership

    await this.prisma.maintenancePlan.delete({
      where: { id },
    });

    return { message: 'Maintenance plan deleted successfully' };
  }

  /**
   * CRITICAL LOGIC: Trigger Manual Work Order Generation
   * This method creates a new Work Order based on the plan's details
   * and updates the nextDueDate by adding the frequency interval.
   * Uses a Prisma transaction to ensure both actions happen atomically.
   */
  async triggerManualGeneration(planId: string, tenantId: string) {
    const plan = await this.findOne(planId, tenantId);

    const result = await this.prisma.$transaction(async (tx) => {
      // Step 1: Create a new Work Order
      const workOrder = await tx.workOrder.create({
        data: {
          title: `[Scheduled] ${plan.title}`,
          description: plan.description || `Preventive maintenance for ${plan.asset.name}`,
          status: 'OPEN',
          priority: 'MEDIUM',
          assetId: plan.assetId,
          tenantId: plan.tenantId,
        },
        include: {
          asset: { select: { name: true } },
        },
      });

      // Step 2: Calculate next due date based on frequency
      const currentDueDate = new Date(plan.nextDueDate);
      let nextDueDate: Date;

      switch (plan.frequency) {
        case 'WEEKLY':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setDate(currentDueDate.getDate() + 7);
          break;
        case 'MONTHLY':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setDate(currentDueDate.getDate() + 30);
          break;
        case 'QUARTERLY':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setMonth(currentDueDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setFullYear(currentDueDate.getFullYear() + 1);
          break;
        default:
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setDate(currentDueDate.getDate() + 30);
      }

      // Step 3: Update the Maintenance Plan
      const updatedPlan = await tx.maintenancePlan.update({
        where: { id: planId },
        data: {
          nextDueDate,
          lastGeneratedAt: new Date(),
        },
        include: {
          asset: { select: { id: true, name: true, category: true } },
        },
      });

      return { workOrder, updatedPlan };
    });

    return result;
  }
}
