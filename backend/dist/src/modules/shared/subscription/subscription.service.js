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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const subscription_config_1 = require("../../../common/config/subscription.config");
let SubscriptionService = class SubscriptionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateAssetLimit(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: { assets: true },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const limit = subscription_config_1.SUBSCRIPTION_LIMITS[tenant.plan];
        const currentCount = tenant._count.assets;
        if (currentCount >= limit) {
            throw new common_1.ForbiddenException(`Plan limit exceeded. Your ${tenant.plan} plan allows up to ${limit} assets. ` +
                `You currently have ${currentCount} assets. Please upgrade your plan to add more.`);
        }
    }
    async getRemainingAssets(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: { assets: true },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const limit = subscription_config_1.SUBSCRIPTION_LIMITS[tenant.plan];
        const currentCount = tenant._count.assets;
        return limit === Infinity ? Infinity : limit - currentCount;
    }
    async getTenantUsage(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                _count: {
                    select: { assets: true },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const limit = subscription_config_1.SUBSCRIPTION_LIMITS[tenant.plan];
        const currentCount = tenant._count.assets;
        const remaining = limit === Infinity ? Infinity : limit - currentCount;
        const percentageUsed = limit === Infinity ? 0 : (currentCount / limit) * 100;
        return {
            plan: tenant.plan,
            limit,
            currentCount,
            remaining,
            percentageUsed: Math.round(percentageUsed),
            isAtLimit: currentCount >= limit,
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map