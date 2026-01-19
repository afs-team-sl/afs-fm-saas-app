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
    async findAll(tenantId) {
        return this.prisma.workOrder.findMany({
            where: { tenantId },
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
        await this.findOne(id, tenantId);
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
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersService);
//# sourceMappingURL=work-orders.service.js.map