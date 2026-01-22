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
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        if (data.serialNo) {
            const existing = await this.prisma.asset.findFirst({
                where: { tenantId: data.tenantId, serialNo: data.serialNo },
            });
            if (existing) {
                throw new common_1.ConflictException('Asset with this serial number already exists');
            }
        }
        return this.prisma.asset.create({ data });
    }
    async findAll(tenantId) {
        return this.prisma.asset.findMany({
            where: { tenantId },
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
    async findOne(id, tenantId) {
        const asset = await this.prisma.asset.findFirst({
            where: { id, tenantId },
            include: {
                workOrders: {
                    include: {
                        assignedTo: {
                            select: { id: true, firstName: true, lastName: true, email: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        return asset;
    }
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
        return this.prisma.asset.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.asset.delete({ where: { id } });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map