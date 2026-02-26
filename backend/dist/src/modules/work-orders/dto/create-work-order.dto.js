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
exports.CreateWorkOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateWorkOrderDto {
    title;
    description;
    priority;
    assetIds;
    assignedToId;
    checklistData;
    legacyId;
}
exports.CreateWorkOrderDto = CreateWorkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the work order',
        example: 'Fix broken HVAC system in Conference Room A',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Detailed description of the work order',
        example: 'The HVAC system is not cooling properly. Temperature is 28°C and should be 22°C.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Priority level of the work order',
        enum: client_1.WorkOrderPriority,
        example: client_1.WorkOrderPriority.HIGH,
        default: client_1.WorkOrderPriority.MEDIUM,
    }),
    (0, class_validator_1.IsEnum)(client_1.WorkOrderPriority),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of asset UUIDs to create work orders for',
        example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateWorkOrderDto.prototype, "assetIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'UUID of the technician (User) assigned to this work order',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dynamic checklist data (e.g., temperature, pressure readings)',
        example: { temperature: 72, pressure: 15, notes: 'All readings normal' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWorkOrderDto.prototype, "checklistData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Legacy ID from old system for migration purposes',
        example: 'WO-2020-001',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "legacyId", void 0);
//# sourceMappingURL=create-work-order.dto.js.map