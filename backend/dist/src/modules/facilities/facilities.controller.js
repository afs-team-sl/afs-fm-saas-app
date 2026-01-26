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
exports.FacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const facilities_service_1 = require("./facilities.service");
const create_building_dto_1 = require("./dto/create-building.dto");
const update_building_dto_1 = require("./dto/update-building.dto");
const create_floor_dto_1 = require("./dto/create-floor.dto");
const update_floor_dto_1 = require("./dto/update-floor.dto");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FacilitiesController = class FacilitiesController {
    facilitiesService;
    constructor(facilitiesService) {
        this.facilitiesService = facilitiesService;
    }
    async getFacilityTree(req) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.getFacilityTree(tenantId);
    }
    async createBuilding(req, createBuildingDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.createBuilding(tenantId, createBuildingDto);
    }
    async findAllBuildings(req) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findAllBuildings(tenantId);
    }
    async findOneBuilding(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findOneBuilding(id, tenantId);
    }
    async updateBuilding(req, id, updateBuildingDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.updateBuilding(id, tenantId, updateBuildingDto);
    }
    async removeBuilding(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.removeBuilding(id, tenantId);
    }
    async createFloor(req, createFloorDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.createFloor(tenantId, createFloorDto);
    }
    async findAllFloors(req, buildingId) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findAllFloors(tenantId, buildingId);
    }
    async findOneFloor(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findOneFloor(id, tenantId);
    }
    async updateFloor(req, id, updateFloorDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.updateFloor(id, tenantId, updateFloorDto);
    }
    async removeFloor(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.removeFloor(id, tenantId);
    }
    async createRoom(req, createRoomDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.createRoom(tenantId, createRoomDto);
    }
    async findAllRooms(req, floorId) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findAllRooms(tenantId, floorId);
    }
    async findOneRoom(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.findOneRoom(id, tenantId);
    }
    async updateRoom(req, id, updateRoomDto) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.updateRoom(id, tenantId, updateRoomDto);
    }
    async removeRoom(req, id) {
        const tenantId = req.user.tenantId;
        return this.facilitiesService.removeRoom(id, tenantId);
    }
};
exports.FacilitiesController = FacilitiesController;
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "getFacilityTree", null);
__decorate([
    (0, common_1.Post)('buildings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_building_dto_1.CreateBuildingDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "createBuilding", null);
__decorate([
    (0, common_1.Get)('buildings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findAllBuildings", null);
__decorate([
    (0, common_1.Get)('buildings/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findOneBuilding", null);
__decorate([
    (0, common_1.Patch)('buildings/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_building_dto_1.UpdateBuildingDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "updateBuilding", null);
__decorate([
    (0, common_1.Delete)('buildings/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "removeBuilding", null);
__decorate([
    (0, common_1.Post)('floors'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_floor_dto_1.CreateFloorDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "createFloor", null);
__decorate([
    (0, common_1.Get)('floors'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('buildingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findAllFloors", null);
__decorate([
    (0, common_1.Get)('floors/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findOneFloor", null);
__decorate([
    (0, common_1.Patch)('floors/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_floor_dto_1.UpdateFloorDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "updateFloor", null);
__decorate([
    (0, common_1.Delete)('floors/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "removeFloor", null);
__decorate([
    (0, common_1.Post)('rooms'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('floorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findAllRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "findOneRoom", null);
__decorate([
    (0, common_1.Patch)('rooms/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "updateRoom", null);
__decorate([
    (0, common_1.Delete)('rooms/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FacilitiesController.prototype, "removeRoom", null);
exports.FacilitiesController = FacilitiesController = __decorate([
    (0, common_1.Controller)('facilities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [facilities_service_1.FacilitiesService])
], FacilitiesController);
//# sourceMappingURL=facilities.controller.js.map