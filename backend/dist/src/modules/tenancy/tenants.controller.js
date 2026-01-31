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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateTenantDto {
    name;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The new name for the organization',
        example: 'Acme Corporation',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateTenantDto.prototype, "name", void 0);
class BroadcastDto {
    message;
    type;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The announcement message',
        example: 'System maintenance scheduled for tomorrow at 2 AM EST',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of announcement',
        enum: client_1.AnnouncementType,
        example: 'INFO',
    }),
    (0, class_validator_1.IsEnum)(client_1.AnnouncementType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "type", void 0);
let TenantsController = class TenantsController {
    tenantsService;
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getCurrentTenant(req) {
        const tenantId = req.user.tenantId;
        return this.tenantsService.findOne(tenantId);
    }
    async updateCurrentTenant(req, updateTenantDto) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only administrators can update organization settings');
        }
        const tenantId = req.user.tenantId;
        return this.tenantsService.update(tenantId, { name: updateTenantDto.name });
    }
    async findAll(req) {
        console.log('-------------------------------------------');
        console.log('🛡️  SUPER ADMIN SECURITY CHECK - findAll()');
        console.log('User Role:', req.user.role);
        console.log('User Tenant ID:', req.user.tenantId);
        if (req.user.role !== 'SUPER_ADMIN') {
            console.log('❌ ACCESS DENIED: NOT SUPER_ADMIN ROLE');
            console.log('-------------------------------------------');
            throw new common_1.ForbiddenException('Access Denied: Only Super Admins can view all organizations.');
        }
        console.log('✅ ACCESS GRANTED: SUPER_ADMIN VERIFIED');
        console.log('-------------------------------------------');
        return this.tenantsService.findAll();
    }
    async impersonateTenant(req, tenantId) {
        console.log('🎭 IMPERSONATION REQUEST');
        console.log('User Role:', req.user.role);
        console.log('Target Tenant ID:', tenantId);
        if (req.user.role !== 'SUPER_ADMIN') {
            console.log('❌ IMPERSONATION DENIED: NOT SUPER_ADMIN ROLE');
            throw new common_1.ForbiddenException('Access Denied: Only Super Admins can impersonate other tenants.');
        }
        console.log('✅ IMPERSONATION ALLOWED');
        return this.tenantsService.generateImpersonationToken(tenantId);
    }
    ;
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s tenant information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current tenant retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getCurrentTenant", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current organization name (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Organization name updated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. Only admins can update organization name.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateCurrentTenant", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all registered organizations (Super Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all tenants retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. You are not a Super Admin.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/impersonate'),
    (0, swagger_1.ApiOperation)({ summary: 'Impersonate as tenant admin (Super Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'JWT token for tenant admin generated.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. You are not a Super Admin.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant or admin user not found.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "impersonateTenant", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, swagger_1.ApiOperation)({ summary: 'Send system-wide broadcast message (Super Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Broadcast message sent successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 403, Create, global, announcement(Super, Admin, Only) { }, ' }): , broadcastMessage(req, broadcastDto) {
            console.log('📢 BROADCAST REQUEST');
            console.log('User Role:', req.user.role);
            if (req.user.role !== 'SUPER_ADMIN') {
                console.log('❌ BROADCAST DENIED: NOT SUPER_ADMIN ROLE');
                throw new common_1.ForbiddenException('Access Denied: Only Super Admins can create global announcements.');
            }
            console.log('✅ BROADCAST CREATING');
            return this.tenantsService.createAnnouncement(broadcastDto.message, broadcastDto.type);
        } }, (), getActiveAnnouncements(, req), {
        const: tenantId = req.user?.tenantId || null,
        return: this.tenantsService.getActiveAnnouncements(tenantId)
    }, (), deleteAnnouncement(, req, , announcementId, string), {
        if(req) { }, : .user.role !== 'SUPER_ADMIN'
    }),
    __metadata("design:type", Object)
], TenantsController.prototype, "", void 0);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants (Super Admin Only)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
{
    throw new common_1.ForbiddenException('Access Denied: Only Super Admins can delete announcements.');
}
return this.tenantsService.deleteAnnouncement(announcementId, , deleteTenant(, req, , tenantId, string), {
    console, : .log('🗑️  TENANT DELETION REQUEST'),
    console, : .log('User Role:', req.user.role),
    console, : .log('Target Tenant ID:', tenantId),
    if(req) { }, : .user.role !== 'SUPER_ADMIN'
});
{
    console.log('❌ DELETION DENIED: NOT SUPER_ADMIN ROLE');
    throw new common_1.ForbiddenException('Access Denied: Only Super Admins can delete tenant organizations.');
}
console.log('✅ DELETION AUTHORIZED');
return this.tenantsService.remove(tenantId);
//# sourceMappingURL=tenants.controller.js.map