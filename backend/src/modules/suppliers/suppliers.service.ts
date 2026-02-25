import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new supplier
   */
  async create(dto: CreateSupplierDto) {
    // Check if supplier name already exists
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: {
        name: dto.name,
      },
    });

    if (existingSupplier) {
      throw new ConflictException(
        `Supplier with name ${dto.name} already exists`,
      );
    }

    return this.prisma.supplier.create({
      data: dto,
    });
  }

  /**
   * Find all suppliers
   */
  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        parts: {
          select: {
            id: true,
            name: true,
            partNumber: true,
          },
        },
      },
    });
  }

  /**
   * Find a specific supplier by ID
   */
  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        parts: {
          select: {
            id: true,
            name: true,
            partNumber: true,
            stockLevel: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Update a supplier
   */
  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);

    // If updating name, check for conflicts
    if (dto.name) {
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: {
          name: dto.name,
          NOT: { id },
        },
      });

      if (existingSupplier) {
        throw new ConflictException(
          `Supplier with name ${dto.name} already exists`,
        );
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a supplier
   */
  async remove(id: string) {
    await this.findOne(id);

    // Check if supplier is linked to any parts
    const linkedParts = await this.prisma.part.count({
      where: { supplierId: id },
    });

    if (linkedParts > 0) {
      throw new ConflictException(
        `Cannot delete supplier. It is linked to ${linkedParts} part(s). Please unlink the parts first.`,
      );
    }

    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
