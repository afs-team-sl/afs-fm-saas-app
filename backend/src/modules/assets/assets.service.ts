import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAssetDto & { tenantId: string }) {
    if (data.serialNo) {
      const existing = await this.prisma.asset.findFirst({
        where: { tenantId: data.tenantId, serialNo: data.serialNo },
      });
      if (existing) {
        throw new ConflictException('Asset with this serial number already exists');
      }
    }
    return this.prisma.asset.create({ data });
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
    return this.prisma.asset.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.asset.delete({ where: { id } });
  }
}