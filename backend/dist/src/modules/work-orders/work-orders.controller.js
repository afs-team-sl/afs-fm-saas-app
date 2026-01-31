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
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const work_orders_service_1 = require("./work-orders.service");
const create_work_order_dto_1 = require("./dto/create-work-order.dto");
const update_work_order_dto_1 = require("./dto/update-work-order.dto");
const add_work_order_part_dto_1 = require("../parts/dto/add-work-order-part.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WorkOrdersController = class WorkOrdersController {
    workOrdersService;
    constructor(workOrdersService) {
        this.workOrdersService = workOrdersService;
    }
    create(createWorkOrderDto, tenantId) {
        return this.workOrdersService.create(tenantId, createWorkOrderDto);
    }
    findAll(tenantId, status, priority, req) {
        const userId = req?.user?.sub;
        const role = req?.user?.role;
        if (status)
            return this.workOrdersService.findByStatus(tenantId, status);
        if (priority)
            return this.workOrdersService.findByPriority(tenantId, priority);
        return this.workOrdersService.findAll(tenantId, userId, role);
    }
    findOverdue(tenantId, req) {
        const userId = req?.user?.sub;
        const role = req?.user?.role;
        return this.workOrdersService.findOverdue(tenantId, role, userId);
    }
    findOne(id, tenantId) {
        return this.workOrdersService.findOne(id, tenantId);
    }
    update(id, tenantId, updateWorkOrderDto) {
        return this.workOrdersService.update(id, tenantId, updateWorkOrderDto);
    }
    remove(id, tenantId) {
        return this.workOrdersService.remove(id, tenantId);
    }
    addPart(id, tenantId, addPartDto) {
        return this.workOrdersService.addPart(id, tenantId, addPartDto);
    }
    getWorkOrderParts(id, tenantId) {
        return this.workOrdersService.getWorkOrderParts(id, tenantId);
    }
    removePart(id, partId, tenantId) {
        return this.workOrdersService.removePart(id, partId, tenantId);
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new work order' }),
    (0, swagger_1.ApiHeader)({
        name: 'x-tenant-id',
        description: 'Tenant ID for data isolation',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Work order successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Token required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_work_order_dto_1.CreateWorkOrderDto, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all work orders for a tenant (Role-Based)' }),
    (0, swagger_1.ApiHeader)({
        name: 'x-tenant-id',
        description: 'Tenant ID for data isolation',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'priority',
        required: false,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of work orders retrieved' }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('overdue/list'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all overdue work orders (SLA breached)' }),
    (0, swagger_1.ApiHeader)({
        name: 'x-tenant-id',
        description: 'Tenant ID for data isolation',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of overdue work orders (dueDate < now and status != COMPLETED)'
    }),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOverdue", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific work order by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Work order retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Work order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a work order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Work order successfully updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_work_order_dto_1.UpdateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a work order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Work order successfully deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/parts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a part to a work order (deducts stock)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Part added and stock deducted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_work_order_part_dto_1.AddWorkOrderPartDto]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "addPart", null);
__decorate([
    (0, common_1.Get)(':id/parts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all parts used in a work order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parts list retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "getWorkOrderParts", null);
__decorate([
    (0, common_1.Delete)(':id/parts/:partId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove a part from work order (restores stock)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Work Order UUID' }),
    (0, swagger_1.ApiParam)({ name: 'partId', description: 'Work Order Part UUID' }),
    (0, swagger_1.ApiHeader)({ name: 'x-tenant-id', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Part removed and stock restored' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('partId')),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "removePart", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Work Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('work-orders'),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService])
], WorkOrdersController);
//# sourceMappingURL=work-orders.controller.js.map