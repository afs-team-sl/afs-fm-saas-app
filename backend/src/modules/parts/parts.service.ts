import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new part with tenant isolation
   */
  async create(tenantId: string, dto: CreatePartDto) {
    // Check if part number already exists for this tenant
    const existingPart = await this.prisma.part.findFirst({
      where: {
        tenantId,
        partNumber: dto.partNumber,
      },
    });

    if (existingPart) {
      throw new ConflictException(
        `Part with number ${dto.partNumber} already exists`,
      );
    }

    return this.prisma.part.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  /**
   * Find all parts for a specific tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.part.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find low stock parts (where stockLevel <= minStock)
   */
  async findLowStock(tenantId: string) {
    const parts = await this.prisma.part.findMany({
      where: { tenantId },
      orderBy: { stockLevel: 'asc' },
    });

    return parts.filter((part) => part.stockLevel <= part.minStock);
  }

  /**
   * Find a specific part by ID
   */
  async findOne(id: string, tenantId: string) {
    const part = await this.prisma.part.findFirst({
      where: { id, tenantId },
      include: {
        workOrderParts: {
          include: {
            workOrder: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  /**
   * Update a part
   */
  async update(id: string, tenantId: string, dto: UpdatePartDto) {
    await this.findOne(id, tenantId);

    // If updating part number, check for conflicts
    if (dto.partNumber) {
      const existingPart = await this.prisma.part.findFirst({
        where: {
          tenantId,
          partNumber: dto.partNumber,
          NOT: { id },
        },
      });

      if (existingPart) {
        throw new ConflictException(
          `Part with number ${dto.partNumber} already exists`,
        );
      }
    }

    return this.prisma.part.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a part
   */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    // Check if part is used in any work orders
    const usageCount = await this.prisma.workOrderPart.count({
      where: { partId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Cannot delete part that has been used in ${usageCount} work order(s)`,
      );
    }

    await this.prisma.part.delete({
      where: { id },
    });

    return { message: 'Part deleted successfully' };
  }

  /**
   * Deduct stock for a part (internal use only)
   */
  async deductStock(partId: string, quantity: number, tenantId: string) {
    const part = await this.findOne(partId, tenantId);

    if (part.stockLevel < quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${part.name}. Available: ${part.stockLevel}, Required: ${quantity}`,
      );
    }

    return this.prisma.part.update({
      where: { id: partId },
      data: {
        stockLevel: {
          decrement: quantity,
        },
      },
    });
  }

  /**
   * Add stock for a part (for restocking)
   */
  async addStock(partId: string, quantity: number, tenantId: string) {
    await this.findOne(partId, tenantId);

    return this.prisma.part.update({
      where: { id: partId },
      data: {
        stockLevel: {
          increment: quantity,
        },
      },
    });
  }
}
