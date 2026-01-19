import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new asset with duplicate serial number check
   */
  async create(data: CreateAssetDto & { tenantId: string }) {
    if (data.serialNo) {
      const existing = await this.prisma.asset.findFirst({
        where: { tenantId: data.tenantId, serialNo: data.serialNo },
      });
      if (existing) {
        throw new ConflictException('Asset with this serial number already exists in your organization');
      }
    }

    return this.prisma.asset.create({ data });
  }

  /**
   * Find all assets belonging to a tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.asset.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Filter assets by status
   */
  async findByStatus(tenantId: string, status: string) {
    return this.prisma.asset.findMany({
      where: { 
        tenantId, 
        status: status as AssetStatus 
      },
    });
  }

  /**
   * Filter assets by category
   */
  async findByCategory(tenantId: string, category: string) {
    return this.prisma.asset.findMany({
      where: { tenantId, category },
    });
  }

  /**
   * Get a specific asset with its related work orders
   */
  async findOne(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: { workOrders: true },
    });

    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  /**
   * Update asset details
   */
  async update(id: string, tenantId: string, dto: UpdateAssetDto) {
    await this.findOne(id, tenantId); // Validate existence

    return this.prisma.asset.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete an asset
   */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}