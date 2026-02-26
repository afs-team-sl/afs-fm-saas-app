import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus, Prisma } from '@prisma/client';
import { SubscriptionService } from '../shared/subscription/subscription.service';
import { StorageService } from '../shared/storage/storage.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private storageService: StorageService,
  ) {}

  async create(data: CreateAssetDto & { tenantId: string }) {
    // 🔒 VALIDATE SUBSCRIPTION LIMITS FIRST
    await this.subscriptionService.validateAssetLimit(data.tenantId);

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
   * Find assets by room
   */
  async findByRoom(tenantId: string, roomId: string) {
    return this.prisma.asset.findMany({
      where: { 
        tenantId, 
        roomId 
      },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find assets by location string (from Excel import)
   */
  async findByLocation(tenantId: string, location: string) {
    return this.prisma.asset.findMany({
      where: { 
        tenantId, 
        location: location
      },
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
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get unique location strings from assets
   * Used for location-based filtering in Work Order creation
   */
  async getUniqueLocations(tenantId: string) {
    const locations = await this.prisma.asset.findMany({
      where: { 
        tenantId,
        location: { not: null }
      },
      distinct: ['location'],
      select: { location: true },
      orderBy: { location: 'asc' }
    });

    return locations
      .filter(l => l.location && l.location.trim() !== '')
      .map(l => l.location);
  }

  /**
   * GET ASSET DETAILS WITH FULL HISTORY & LATEST READINGS 🛡️
   * We include nested relations to show who did each work order.
   */
  async findOne(id: string, tenantId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
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
        workOrders: {
          include: {
            assignedTo: { // වැඩේ කරපු කෙනාගේ විස්තරත් මෙතනින් ගන්නවා
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' } // අලුත්ම වැඩ උඩට එන්න
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!asset) throw new NotFoundException('Asset not found');

    // Extract latest readings from the most recent COMPLETED work order
    const latestCompletedWorkOrder = await this.prisma.workOrder.findFirst({
      where: {
        assetId: id,
        status: 'COMPLETED',
        checklistData: { not: Prisma.JsonNull }
      },
      orderBy: { updatedAt: 'desc' },
      take: 1,
      select: { checklistData: true }
    });

    const latestReadings = latestCompletedWorkOrder?.checklistData || null;

    return {
      ...asset,
      latestReadings
    };
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

  async remove(id: string, tenantId: string, userEmail?: string) {
    const asset = await this.findOne(id, tenantId);
    
    // 📝 Create Audit Log Entry
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true }
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETED_ASSET',
        target: `Asset: ${asset.name} (${asset.category})`,
        performedBy: userEmail || 'Unknown',
        tenantName: tenant?.name || 'Unknown',
        metadata: JSON.stringify({ assetId: id, serialNo: asset.serialNo })
      }
    });

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

  /**
   * UPLOAD ASSET PROFILE IMAGE 📷
   * Uploads to Azure Blob Storage and updates asset record
   */
  async uploadImage(
    assetId: string,
    tenantId: string,
    file: Express.Multer.File
  ): Promise<string> {
    // Verify asset exists and belongs to tenant
    const asset = await this.findOne(assetId, tenantId);

    // Delete old image if exists
    if (asset.image) {
      try {
        await this.storageService.deleteFile(asset.image, 'asset-images');
      } catch (error) {
        console.warn('Failed to delete old asset image:', error);
      }
    }

    // Upload new image to Azure Blob Storage
    const imageUrl = await this.storageService.uploadFile(file, 'asset-images');

    // Update asset record
    await this.prisma.asset.update({
      where: { id: assetId },
      data: { image: imageUrl }
    });

    return imageUrl;
  }

  /**
   * UPLOAD ASSET DOCUMENT 📄
   * Uploads manual, datasheet, or other documentation
   */
  async uploadDocument(
    assetId: string,
    tenantId: string,
    file: Express.Multer.File
  ) {
    // Verify asset exists and belongs to tenant
    await this.findOne(assetId, tenantId);

    // Upload document to Azure Blob Storage
    const fileUrl = await this.storageService.uploadFile(file, 'asset-documents');

    // Create document record
    const document = await this.prisma.assetDocument.create({
      data: {
        name: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        assetId
      }
    });

    return document;
  }

  /**
   * GET ALL DOCUMENTS FOR AN ASSET 📋
   */
  async getDocuments(assetId: string, tenantId: string) {
    // Verify asset belongs to tenant
    await this.findOne(assetId, tenantId);

    return this.prisma.assetDocument.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * DELETE A DOCUMENT 🗑️
   */
  async deleteDocument(
    assetId: string,
    documentId: string,
    tenantId: string
  ) {
    // Verify asset belongs to tenant
    await this.findOne(assetId, tenantId);

    const document = await this.prisma.assetDocument.findUnique({
      where: { id: documentId }
    });

    if (!document || document.assetId !== assetId) {
      throw new NotFoundException('Document not found');
    }

    // Delete from Azure Blob Storage
    try {
      await this.storageService.deleteFile(document.fileUrl, 'asset-documents');
    } catch (error) {
      console.warn('Failed to delete document from storage:', error);
    }

    // Delete database record
    await this.prisma.assetDocument.delete({
      where: { id: documentId }
    });

    return { message: 'Document deleted successfully' };
  }
}