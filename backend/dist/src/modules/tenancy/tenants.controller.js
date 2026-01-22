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
        const masterSuperId = process.env.SUPER_TENANT_ID || '05642b69-8f04-44d0-b74c-27c9db4b4969';
        const currentUserTenantId = req.user.tenantId;
        console.log('-------------------------------------------');
        console.log('🛡️  SUPER ADMIN SECURITY CHECK');
        console.log('Logged User Tenant ID:', currentUserTenantId);
        console.log('System Required ID:   ', masterSuperId);
        if (currentUserTenantId?.trim() !== masterSuperId?.trim()) {
            console.log('❌ ACCESS DENIED: ID MISMATCH');
            throw new common_1.ForbiddenException('Access Denied: Your organization does not have permission to view global data.');
        }
        console.log('✅ ACCESS GRANTED: WELCOME MASTER ADMIN');
        console.log('-------------------------------------------');
        return this.tenantsService.findAll();
    }
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
    (0, swagger_1.ApiOperation)({ summary: 'Get all registered organizations (Internal Use Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all tenants retrieved.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden. You are not a Super Admin.' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants (Super Admin Only)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map