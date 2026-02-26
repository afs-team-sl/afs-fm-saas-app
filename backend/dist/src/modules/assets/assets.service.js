"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const subscription_service_1 = require("../shared/subscription/subscription.service");
const storage_service_1 = require("../shared/storage/storage.service");
let AssetsService = class AssetsService {
    prisma;
    subscriptionService;
    storageService;
    constructor(prisma, subscriptionService, storageService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.storageService = storageService;
    }
    async create(data) {
        await this.subscriptionService.validateAssetLimit(data.tenantId);
        if (data.serialNo && data.serialNo.trim()) {
            const existing = await this.prisma.asset.findFirst({
                where: { tenantId: data.tenantId, serialNo: data.serialNo },
            });
            if (existing) {
                throw new common_1.ConflictException('Asset with this serial number already exists');
            }
        }
        const cleanedData = {
            ...data,
            serialNo: data.serialNo && data.serialNo.trim() ? data.serialNo : null,
            roomId: data.roomId && data.roomId.trim() ? data.roomId : null,
        };
        return this.prisma.asset.create({ data: cleanedData });
    }
    async findAll(tenantId) {
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
    async findByStatus(tenantId, status) {
        return this.prisma.asset.findMany({
            where: {
                tenantId,
                status: status
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByCategory(tenantId, category) {
        return this.prisma.asset.findMany({
            where: {
                tenantId,
                category
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByRoom(tenantId, roomId) {
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
    async findByLocation(tenantId, location) {
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
    async getUniqueLocations(tenantId) {
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
    async findOne(id, tenantId) {
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
                        assignedTo: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                documents: {
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        const latestCompletedWorkOrder = await this.prisma.workOrder.findFirst({
            where: {
                assetId: id,
                status: 'COMPLETED',
                checklistData: { not: client_1.Prisma.JsonNull }
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
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
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
    async remove(id, tenantId, userEmail) {
        const asset = await this.findOne(id, tenantId);
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
    async createBulk(tenantId, assets) {
        const cleanedAssets = assets.map(asset => ({
            ...asset,
            tenantId,
            serialNo: asset.serialNo ? String(asset.serialNo).trim() || null : null,
            roomId: asset.roomId && asset.roomId.trim() ? asset.roomId : null,
            site: asset.site && asset.site.trim() ? asset.site : null,
            location: asset.location && asset.location.trim() ? asset.location : null,
            customId: asset.customId && asset.customId.trim() ? asset.customId : null,
            assetNumber: asset.assetNumber ? String(asset.assetNumber).trim() || null : null,
            manufacturer: asset.manufacturer && asset.manufacturer.trim() ? asset.manufacturer : null,
            modelNumber: asset.modelNumber && asset.modelNumber.trim() ? asset.modelNumber : null,
            filterSize: asset.filterSize && asset.filterSize.trim() ? asset.filterSize : null,
            beltSize: asset.beltSize && asset.beltSize.trim() ? asset.beltSize : null,
            notes: asset.notes && asset.notes.trim() ? asset.notes : null,
        }));
        const result = await this.prisma.asset.createMany({
            data: cleanedAssets,
            skipDuplicates: true,
        });
        return {
            count: result.count,
            message: `Successfully imported ${result.count} asset(s)`,
        };
    }
    async removeAll(tenantId) {
        const result = await this.prisma.asset.deleteMany({
            where: { tenantId },
        });
        return {
            count: result.count,
            message: `Successfully deleted ${result.count} asset(s)`,
        };
    }
    async uploadImage(assetId, tenantId, file) {
        const asset = await this.findOne(assetId, tenantId);
        if (asset.image) {
            try {
                await this.storageService.deleteFile(asset.image, 'asset-images');
            }
            catch (error) {
                console.warn('Failed to delete old asset image:', error);
            }
        }
        const imageUrl = await this.storageService.uploadFile(file, 'asset-images');
        await this.prisma.asset.update({
            where: { id: assetId },
            data: { image: imageUrl }
        });
        return imageUrl;
    }
    async uploadDocument(assetId, tenantId, file) {
        await this.findOne(assetId, tenantId);
        const fileUrl = await this.storageService.uploadFile(file, 'asset-documents');
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
    async getDocuments(assetId, tenantId) {
        await this.findOne(assetId, tenantId);
        return this.prisma.assetDocument.findMany({
            where: { assetId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async deleteDocument(assetId, documentId, tenantId) {
        await this.findOne(assetId, tenantId);
        const document = await this.prisma.assetDocument.findUnique({
            where: { id: documentId }
        });
        if (!document || document.assetId !== assetId) {
            throw new common_1.NotFoundException('Document not found');
        }
        try {
            await this.storageService.deleteFile(document.fileUrl, 'asset-documents');
        }
        catch (error) {
            console.warn('Failed to delete document from storage:', error);
        }
        await this.prisma.assetDocument.delete({
            where: { id: documentId }
        });
        return { message: 'Document deleted successfully' };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        storage_service_1.StorageService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map