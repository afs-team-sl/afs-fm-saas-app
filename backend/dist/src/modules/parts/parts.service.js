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
exports.PartsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PartsService = class PartsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        const existingPart = await this.prisma.part.findFirst({
            where: {
                tenantId,
                partNumber: dto.partNumber,
            },
        });
        if (existingPart) {
            throw new common_1.ConflictException(`Part with number ${dto.partNumber} already exists`);
        }
        return this.prisma.part.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.part.findMany({
            where: { tenantId },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findLowStock(tenantId) {
        const parts = await this.prisma.part.findMany({
            where: { tenantId },
            orderBy: { stockLevel: 'asc' },
        });
        return parts.filter((part) => part.stockLevel <= part.minStock);
    }
    async findOne(id, tenantId) {
        const part = await this.prisma.part.findFirst({
            where: { id, tenantId },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        contactPerson: true,
                    },
                },
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
            throw new common_1.NotFoundException(`Part with ID ${id} not found`);
        }
        return part;
    }
    async update(id, tenantId, dto) {
        await this.findOne(id, tenantId);
        if (dto.partNumber) {
            const existingPart = await this.prisma.part.findFirst({
                where: {
                    tenantId,
                    partNumber: dto.partNumber,
                    NOT: { id },
                },
            });
            if (existingPart) {
                throw new common_1.ConflictException(`Part with number ${dto.partNumber} already exists`);
            }
        }
        return this.prisma.part.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        const usageCount = await this.prisma.workOrderPart.count({
            where: { partId: id },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete part that has been used in ${usageCount} work order(s)`);
        }
        await this.prisma.part.delete({
            where: { id },
        });
        return { message: 'Part deleted successfully' };
    }
    async deductStock(partId, quantity, tenantId) {
        const part = await this.findOne(partId, tenantId);
        if (part.stockLevel < quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for ${part.name}. Available: ${part.stockLevel}, Required: ${quantity}`);
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
    async addStock(partId, quantity, tenantId) {
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
};
exports.PartsService = PartsService;
exports.PartsService = PartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartsService);
//# sourceMappingURL=parts.service.js.map