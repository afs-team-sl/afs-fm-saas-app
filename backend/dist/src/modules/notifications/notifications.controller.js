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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_global_notification_dto_1 = require("./dto/create-global-notification.dto");
const update_global_notification_dto_1 = require("./dto/update-global-notification.dto");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(req) {
        const userId = req.user.sub;
        const tenantId = req.user.tenantId;
        return this.notificationsService.getUserNotifications(userId, tenantId);
    }
    async markAsRead(req, notificationId) {
        const userId = req.user.sub;
        return this.notificationsService.markAsRead(notificationId, userId);
    }
    async markAllAsRead(req) {
        const userId = req.user.sub;
        return this.notificationsService.markAllAsRead(userId);
    }
    async getAllGlobalNotifications(req, activeOnly) {
        const tenantId = req.user.tenantId;
        const active = activeOnly === 'true';
        return this.notificationsService.getAllGlobalNotifications(active);
    }
    async getGlobalNotification(id) {
        return this.notificationsService.getGlobalNotification(id);
    }
    async createGlobalNotification(req, dto) {
        const tenantId = req.user.tenantId;
        return this.notificationsService.createGlobalNotification(tenantId, dto);
    }
    async updateGlobalNotification(req, id, dto) {
        const tenantId = req.user.tenantId;
        return this.notificationsService.updateGlobalNotification(tenantId, id, dto);
    }
    async deleteGlobalNotification(req, id) {
        const tenantId = req.user.tenantId;
        return this.notificationsService.deleteGlobalNotification(tenantId, id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest notifications for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Get)('global/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all global notifications (Super Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'activeOnly', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global notifications retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only Super Admin can access.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAllGlobalNotifications", null);
__decorate([
    (0, common_1.Get)('global/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single global notification by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global notification retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getGlobalNotification", null);
__decorate([
    (0, common_1.Post)('global'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new global notification (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Global notification created successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only Super Admin can create.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_global_notification_dto_1.CreateGlobalNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createGlobalNotification", null);
__decorate([
    (0, common_1.Patch)('global/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a global notification (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global notification updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only Super Admin can update.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_global_notification_dto_1.UpdateGlobalNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateGlobalNotification", null);
__decorate([
    (0, common_1.Delete)('global/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a global notification (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Global notification deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only Super Admin can delete.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteGlobalNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map