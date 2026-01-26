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
exports.MaintenancePlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let MaintenancePlansService = class MaintenancePlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, tenantId) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: dto.assetId },
        });
        if (!asset || asset.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Asset not found or access denied');
        }
        return this.prisma.maintenancePlan.create({
            data: {
                title: dto.title,
                description: dto.description,
                frequency: dto.frequency,
                nextDueDate: new Date(dto.nextDueDate),
                assetId: dto.assetId,
                tenantId,
            },
            include: {
                asset: { select: { id: true, name: true, category: true } },
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.maintenancePlan.findMany({
            where: { tenantId },
            include: {
                asset: { select: { id: true, name: true, category: true, status: true } },
            },
            orderBy: { nextDueDate: 'asc' },
        });
    }
    async findOne(id, tenantId) {
        const plan = await this.prisma.maintenancePlan.findUnique({
            where: { id },
            include: {
                asset: { select: { id: true, name: true, category: true, status: true } },
            },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Maintenance plan not found');
        }
        if (plan.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return plan;
    }
    async update(id, dto, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.maintenancePlan.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.frequency && { frequency: dto.frequency }),
                ...(dto.nextDueDate && { nextDueDate: new Date(dto.nextDueDate) }),
            },
            include: {
                asset: { select: { id: true, name: true, category: true } },
            },
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.prisma.maintenancePlan.delete({
            where: { id },
        });
        return { message: 'Maintenance plan deleted successfully' };
    }
    async triggerManualGeneration(planId, tenantId) {
        const plan = await this.findOne(planId, tenantId);
        const result = await this.prisma.$transaction(async (tx) => {
            const workOrder = await tx.workOrder.create({
                data: {
                    title: `[Scheduled] ${plan.title}`,
                    description: plan.description || `Preventive maintenance for ${plan.asset.name}`,
                    status: 'OPEN',
                    priority: 'MEDIUM',
                    assetId: plan.assetId,
                    tenantId: plan.tenantId,
                },
                include: {
                    asset: { select: { name: true } },
                },
            });
            const currentDueDate = new Date(plan.nextDueDate);
            let nextDueDate;
            switch (plan.frequency) {
                case 'WEEKLY':
                    nextDueDate = new Date(currentDueDate);
                    nextDueDate.setDate(currentDueDate.getDate() + 7);
                    break;
                case 'MONTHLY':
                    nextDueDate = new Date(currentDueDate);
                    nextDueDate.setDate(currentDueDate.getDate() + 30);
                    break;
                case 'QUARTERLY':
                    nextDueDate = new Date(currentDueDate);
                    nextDueDate.setMonth(currentDueDate.getMonth() + 3);
                    break;
                case 'YEARLY':
                    nextDueDate = new Date(currentDueDate);
                    nextDueDate.setFullYear(currentDueDate.getFullYear() + 1);
                    break;
                default:
                    nextDueDate = new Date(currentDueDate);
                    nextDueDate.setDate(currentDueDate.getDate() + 30);
            }
            const updatedPlan = await tx.maintenancePlan.update({
                where: { id: planId },
                data: {
                    nextDueDate,
                    lastGeneratedAt: new Date(),
                },
                include: {
                    asset: { select: { id: true, name: true, category: true } },
                },
            });
            return { workOrder, updatedPlan };
        });
        return result;
    }
};
exports.MaintenancePlansService = MaintenancePlansService;
exports.MaintenancePlansService = MaintenancePlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaintenancePlansService);
//# sourceMappingURL=maintenance-plans.service.js.map