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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let TenantsService = class TenantsService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        assets: true,
                        workOrders: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        assets: true,
                        workOrders: true,
                    },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
    async update(id, data) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return this.prisma.tenant.update({
            where: { id },
            data: { name: data.name },
            include: {
                _count: {
                    select: {
                        users: true,
                        assets: true,
                        workOrders: true,
                    },
                },
            },
        });
    }
    async generateImpersonationToken(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const adminUser = await this.prisma.user.findFirst({
            where: {
                tenantId: tenantId,
                role: 'ADMIN',
            },
        });
        if (!adminUser) {
            throw new common_1.NotFoundException(`No admin user found for tenant ${tenant.name}`);
        }
        const payload = {
            sub: adminUser.id,
            email: adminUser.email,
            tenantId: adminUser.tenantId,
            role: adminUser.role,
        };
        const access_token = await this.jwtService.signAsync(payload);
        console.log(`🎭 Impersonation token generated for ${adminUser.email} (${tenant.name})`);
        return {
            access_token,
            user: {
                id: adminUser.id,
                email: adminUser.email,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                role: adminUser.role,
                tenantId: adminUser.tenantId,
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
            },
        };
    }
    async createBroadcast(message, type) {
        const notification = await this.prisma.globalNotification.create({
            data: {
                message,
                type: type || 'INFO',
                isActive: true,
            },
        });
        console.log(`📢 Broadcast created: "${message}" (Type: ${notification.type})`);
        return {
            message: 'Broadcast sent successfully',
            notification,
        };
    }
    async getActiveNotifications() {
        return this.prisma.globalNotification.findMany({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map