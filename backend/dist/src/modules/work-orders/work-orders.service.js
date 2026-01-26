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
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let WorkOrdersService = class WorkOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    includeRelations = {
        asset: true,
        assignedTo: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        },
        parts: {
            include: {
                part: true,
            },
        },
    };
    async create(tenantId, dto) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id: dto.assetId,
                tenantId: tenantId,
            },
        });
        if (!asset) {
            throw new common_1.BadRequestException(`Asset with ID ${dto.assetId} not found in your organization`);
        }
        return this.prisma.workOrder.create({
            data: {
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                assetId: dto.assetId,
                tenantId: tenantId,
                assignedToId: dto.assignedToId,
            },
            include: this.includeRelations,
        });
    }
    async findAll(tenantId, userId, role) {
        const whereClause = { tenantId };
        if (role === 'TECHNICIAN' && userId) {
            whereClause.assignedToId = userId;
        }
        return this.prisma.workOrder.findMany({
            where: whereClause,
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByStatus(tenantId, status) {
        return this.prisma.workOrder.findMany({
            where: {
                tenantId,
                status: status
            },
            include: this.includeRelations,
        });
    }
    async findByPriority(tenantId, priority) {
        return this.prisma.workOrder.findMany({
            where: {
                tenantId,
                priority: priority
            },
            include: this.includeRelations,
        });
    }
    async findOne(id, tenantId) {
        const workOrder = await this.prisma.workOrder.findFirst({
            where: { id, tenantId },
            include: this.includeRelations,
        });
        if (!workOrder) {
            throw new common_1.NotFoundException(`Work order with ID ${id} not found`);
        }
        return workOrder;
    }
    async update(id, tenantId, dto) {
        const existingWorkOrder = await this.findOne(id, tenantId);
        const isBeingCompleted = dto.status === 'COMPLETED' && existingWorkOrder.status !== 'COMPLETED';
        if (isBeingCompleted) {
            return this.prisma.$transaction(async (tx) => {
                const workOrderParts = await tx.workOrderPart.findMany({
                    where: { workOrderId: id },
                    include: { part: true },
                });
                for (const woPart of workOrderParts) {
                    if (woPart.part.stockLevel < woPart.quantity) {
                        throw new common_1.BadRequestException(`Insufficient stock for ${woPart.part.name}. Available: ${woPart.part.stockLevel}, Required: ${woPart.quantity}`);
                    }
                    await tx.part.update({
                        where: { id: woPart.partId },
                        data: {
                            stockLevel: {
                                decrement: woPart.quantity,
                            },
                        },
                    });
                }
                return tx.workOrder.update({
                    where: { id },
                    data: dto,
                    include: this.includeRelations,
                });
            });
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: dto,
            include: this.includeRelations,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.workOrder.delete({
            where: { id },
        });
        return { message: 'Work order deleted successfully' };
    }
    async addPart(workOrderId, tenantId, dto) {
        const workOrder = await this.findOne(workOrderId, tenantId);
        if (workOrder.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot add parts to a completed work order');
        }
        if (workOrder.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot add parts to a cancelled work order');
        }
        const part = await this.prisma.part.findFirst({
            where: {
                id: dto.partId,
                tenantId: tenantId,
            },
        });
        if (!part) {
            throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found in your organization`);
        }
        if (part.stockLevel < dto.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for ${part.name}. Available: ${part.stockLevel}, Required: ${dto.quantity}. Stock will be deducted when work order is completed.`);
        }
        const workOrderPart = await this.prisma.workOrderPart.create({
            data: {
                workOrderId: workOrderId,
                partId: dto.partId,
                quantity: dto.quantity,
            },
            include: {
                part: true,
            },
        });
        return workOrderPart;
    }
    async getWorkOrderParts(workOrderId, tenantId) {
        await this.findOne(workOrderId, tenantId);
        return this.prisma.workOrderPart.findMany({
            where: { workOrderId },
            include: {
                part: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async removePart(workOrderId, workOrderPartId, tenantId) {
        const workOrder = await this.findOne(workOrderId, tenantId);
        if (workOrder.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot remove parts from a completed work order. Stock has already been deducted.');
        }
        const workOrderPart = await this.prisma.workOrderPart.findUnique({
            where: { id: workOrderPartId },
            include: { part: true },
        });
        if (!workOrderPart || workOrderPart.workOrderId !== workOrderId) {
            throw new common_1.NotFoundException('Work order part not found');
        }
        await this.prisma.workOrderPart.delete({
            where: { id: workOrderPartId },
        });
        return { message: 'Part removed from work order' };
    }
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersService);
//# sourceMappingURL=work-orders.service.js.map