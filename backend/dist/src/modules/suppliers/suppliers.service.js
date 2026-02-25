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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existingSupplier = await this.prisma.supplier.findFirst({
            where: {
                name: dto.name,
            },
        });
        if (existingSupplier) {
            throw new common_1.ConflictException(`Supplier with name ${dto.name} already exists`);
        }
        return this.prisma.supplier.create({
            data: dto,
        });
    }
    async findAll() {
        return this.prisma.supplier.findMany({
            orderBy: { name: 'asc' },
            include: {
                parts: {
                    select: {
                        id: true,
                        name: true,
                        partNumber: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: {
                parts: {
                    select: {
                        id: true,
                        name: true,
                        partNumber: true,
                        stockLevel: true,
                        unitPrice: true,
                    },
                },
            },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.name) {
            const existingSupplier = await this.prisma.supplier.findFirst({
                where: {
                    name: dto.name,
                    NOT: { id },
                },
            });
            if (existingSupplier) {
                throw new common_1.ConflictException(`Supplier with name ${dto.name} already exists`);
            }
        }
        return this.prisma.supplier.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const linkedParts = await this.prisma.part.count({
            where: { supplierId: id },
        });
        if (linkedParts > 0) {
            throw new common_1.ConflictException(`Cannot delete supplier. It is linked to ${linkedParts} part(s). Please unlink the parts first.`);
        }
        return this.prisma.supplier.delete({
            where: { id },
        });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map