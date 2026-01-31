import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssetDto & { tenantId: string }) {
    // Validate unique serial number if provided
    if (data.serialNo && data.serialNo.trim()) {
      const existing = await this.prisma.asset.findFirst({
        where: { tenantId: data.tenantId, serialNo: data.serialNo },
      });
      if (existing) {
        throw new ConflictException('Asset with this serial number already exists');
      }
    }

    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...data,
      serialNo: data.serialNo && data.serialNo.trim() ? data.serialNo : null,
      roomId: data.roomId && data.roomId.trim() ? data.roomId : null,
    };

    return this.prisma.asset.create({ data: cleanedData });
  }

  async findAll(tenantId: string) {
    return this.prisma.asset.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find assets by status
   */
  async findByStatus(tenantId: string, status: string) {
    return this.prisma.asset.findMany({
      where: { 
        tenantId, 
        status: status as AssetStatus 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find assets by category
   */
  async findByCategory(tenantId: string, category: string) {
    return this.prisma.asset.findMany({
      where: { 
        tenantId, 
        category 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * GET ASSET DETAILS WITH FULL HISTORY 🛡️
   * We include nested relations to show who did each work order.
   */
  async findOne(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: { 
        workOrders: {
          include: {
            assignedTo: { // වැඩේ කරපු කෙනාගේ විස්තරත් මෙතනින් ගන්නවා
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' } // අලුත්ම වැඩ උඩට එන්න
        } 
      },
    });

    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async update(id: string, tenantId: string, dto: UpdateAssetDto) {
    await this.findOne(id, tenantId);
    
    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...dto,
      serialNo: dto.serialNo !== undefined 
        ? (dto.serialNo && dto.serialNo.trim() ? dto.serialNo : null)
        : undefined,
      roomId: dto.roomId !== undefined
        ? (dto.roomId && dto.roomId.trim() ? dto.roomId : null)
        : undefined,
    };

    return this.prisma.asset.update({
      where: { id },
      data: cleanedData,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.asset.delete({ where: { id } });
  }

  /**
   * BULK CREATE ASSETS 📦
   * Used for Excel/CSV imports
   * Uses createMany with skipDuplicates to prevent errors
   */
  async createBulk(tenantId: string, assets: CreateAssetDto[]) {
    // Clean up the data and add tenantId
    // Convert all fields to strings to avoid Excel formatting issues
    const cleanedAssets = assets.map(asset => ({
      ...asset,
      tenantId,
      // Convert to string and trim - Excel "Serial" → serialNo
      serialNo: asset.serialNo ? String(asset.serialNo).trim() || null : null,
      roomId: asset.roomId && asset.roomId.trim() ? asset.roomId : null,
      site: asset.site && asset.site.trim() ? asset.site : null,
      location: asset.location && asset.location.trim() ? asset.location : null,
      customId: asset.customId && asset.customId.trim() ? asset.customId : null,
      // Convert to string and trim - Excel "Number" → assetNumber
      assetNumber: asset.assetNumber ? String(asset.assetNumber).trim() || null : null,
      manufacturer: asset.manufacturer && asset.manufacturer.trim() ? asset.manufacturer : null,
      modelNumber: asset.modelNumber && asset.modelNumber.trim() ? asset.modelNumber : null,
      filterSize: asset.filterSize && asset.filterSize.trim() ? asset.filterSize : null,
      beltSize: asset.beltSize && asset.beltSize.trim() ? asset.beltSize : null,
      notes: asset.notes && asset.notes.trim() ? asset.notes : null,
    }));

    const result = await this.prisma.asset.createMany({
      data: cleanedAssets,
      skipDuplicates: true, // Skip assets with duplicate unique constraints
    });

    return {
      count: result.count,
      message: `Successfully imported ${result.count} asset(s)`,
    };
  }

  /**
   * REMOVE ALL ASSETS 🗑️
   * Deletes all assets for a specific tenant
   * Use with caution - this is a destructive operation!
   */
  async removeAll(tenantId: string) {
    const result = await this.prisma.asset.deleteMany({
      where: { tenantId },
    });

    return {
      count: result.count,
      message: `Successfully deleted ${result.count} asset(s)`,
    };
  }
}