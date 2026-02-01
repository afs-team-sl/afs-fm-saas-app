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
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SystemService = class SystemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        let settings = await this.prisma.systemSettings.findUnique({
            where: { id: 'system' }
        });
        if (!settings) {
            settings = await this.prisma.systemSettings.create({
                data: {
                    id: 'system',
                    isMaintenanceMode: false,
                    maintenanceMessage: null
                }
            });
        }
        return settings;
    }
    async toggleMaintenanceMode(enabled, message) {
        const settings = await this.getSettings();
        return this.prisma.systemSettings.update({
            where: { id: 'system' },
            data: {
                isMaintenanceMode: enabled,
                maintenanceMessage: message || null
            }
        });
    }
    async getAuditLogs(limit = 100) {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
    async createAuditLog(data) {
        return this.prisma.auditLog.create({ data });
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
//# sourceMappingURL=system.service.js.map