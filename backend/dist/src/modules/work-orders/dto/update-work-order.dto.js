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
exports.UpdateWorkOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateWorkOrderDto {
    title;
    description;
    status;
    priority;
    completionNote;
    assignedToId;
    dueDate;
    startedAt;
    laborHours;
    checklistData;
}
exports.UpdateWorkOrderDto = UpdateWorkOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated title of the work order',
        example: 'Fix broken HVAC system in Conference Room A - URGENT',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated description of the work order',
        example: 'The HVAC system has completely failed. Temperature is now 30°C.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated status of the work order',
        enum: client_1.WorkOrderStatus,
        example: client_1.WorkOrderStatus.IN_PROGRESS,
    }),
    (0, class_validator_1.IsEnum)(client_1.WorkOrderStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated priority level of the work order',
        enum: client_1.WorkOrderPriority,
        example: client_1.WorkOrderPriority.URGENT,
    }),
    (0, class_validator_1.IsEnum)(client_1.WorkOrderPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Completion notes written by the technician',
        example: 'Replaced faulty capacitor. System tested and running normally.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "completionNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated UUID of the technician assigned to this work order',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'SLA due date for this work order (ISO 8601 format)',
        example: '2026-02-15T17:00:00Z',
    }),
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When the technician started working (auto-set on IN_PROGRESS)',
        example: '2026-01-31T14:30:00Z',
    }),
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWorkOrderDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total labor hours spent (auto-calculated on COMPLETED)',
        example: 2.5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateWorkOrderDto.prototype, "laborHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dynamic checklist data for operational readings (JSON object)',
        example: { waterPressure: 45, supplyTemp: 180, returnTemp: 160 },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateWorkOrderDto.prototype, "checklistData", void 0);
//# sourceMappingURL=update-work-order.dto.js.map