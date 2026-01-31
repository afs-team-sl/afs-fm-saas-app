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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    SUPER_TENANT_ID = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';
    async getUserNotifications(userId, tenantId) {
        const notifications = await this.prisma.notification.findMany({
            where: {
                userId,
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });
        const unreadCount = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
                OR: [
                    { tenantId: tenantId },
                    { tenantId: null },
                ],
            },
        });
        return {
            notifications,
            unreadCount,
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${notificationId} not found`);
        }
        if (notification.userId !== userId) {
            throw new common_1.ForbiddenException('You can only mark your own notifications as read');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        return {
            message: 'All notifications marked as read',
            count: result.count,
        };
    }
    async createNotification(userId, message, type, tenantId) {
        return this.prisma.notification.create({
            data: {
                userId,
                message,
                type,
                tenantId,
            },
        });
    }
    verifySuperAdmin(tenantId) {
        if (tenantId?.trim() !== this.SUPER_TENANT_ID?.trim()) {
            throw new common_1.ForbiddenException('Access Denied: Only Super Admin can manage global notifications');
        }
    }
    async getAllGlobalNotifications(activeOnly = false) {
        const where = activeOnly ? { isActive: true } : {};
        return this.prisma.globalNotification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getGlobalNotification(id) {
        const notification = await this.prisma.globalNotification.findUnique({
            where: { id },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Global notification with ID ${id} not found`);
        }
        return notification;
    }
    async createGlobalNotification(tenantId, dto) {
        this.verifySuperAdmin(tenantId);
        const notification = await this.prisma.globalNotification.create({
            data: {
                message: dto.message,
                type: dto.type || 'INFO',
                isActive: dto.isActive !== undefined ? dto.isActive : true,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });
        console.log(`📢 Global notification created: "${notification.message}" (Type: ${notification.type})`);
        if (notification.isActive) {
            const allUsers = await this.prisma.user.findMany({
                select: { id: true },
            });
            const userNotificationType = this.mapGlobalToUserNotificationType(dto.type || 'INFO');
            await this.prisma.notification.createMany({
                data: allUsers.map((user) => ({
                    userId: user.id,
                    message: dto.message,
                    type: userNotificationType,
                    tenantId: null,
                    isRead: false,
                })),
            });
            console.log(`📬 Created ${allUsers.length} user notifications for global broadcast`);
        }
        return notification;
    }
    mapGlobalToUserNotificationType(type) {
        switch (type) {
            case 'CRITICAL':
                return 'ERROR';
            case 'MAINTENANCE':
            case 'WARNING':
                return 'WARNING';
            default:
                return 'INFO';
        }
    }
    async updateGlobalNotification(tenantId, id, dto) {
        this.verifySuperAdmin(tenantId);
        const existing = await this.prisma.globalNotification.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Global notification with ID ${id} not found`);
        }
        const updateData = {};
        if (dto.message !== undefined)
            updateData.message = dto.message;
        if (dto.type !== undefined)
            updateData.type = dto.type;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.expiresAt !== undefined) {
            updateData.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
        }
        const updated = await this.prisma.globalNotification.update({
            where: { id },
            data: updateData,
        });
        console.log(`✏️ Global notification updated: ID ${id}`);
        return updated;
    }
    async deleteGlobalNotification(tenantId, id) {
        this.verifySuperAdmin(tenantId);
        const existing = await this.prisma.globalNotification.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Global notification with ID ${id} not found`);
        }
        await this.prisma.globalNotification.delete({
            where: { id },
        });
        console.log(`🗑️ Global notification deleted: ID ${id}`);
        return {
            message: 'Global notification deleted successfully',
            id,
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map