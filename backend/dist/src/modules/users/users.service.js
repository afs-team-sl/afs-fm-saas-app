"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                tenantId: tenantId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                tenantId: true,
                createdAt: true,
            },
        });
    }
    async findAll(tenantId, role, roleFilter) {
        if (role === 'SUPER_ADMIN') {
            console.log('🔓 SUPER_ADMIN access: Fetching ALL users across all tenants');
            const whereClause = {};
            if (roleFilter) {
                whereClause.role = roleFilter;
                console.log(`   Filtering by role: ${roleFilter}`);
            }
            return this.prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    tenantId: true,
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: [
                    { tenantId: 'asc' },
                    { createdAt: 'desc' },
                ],
            });
        }
        if (!tenantId) {
            throw new common_1.BadRequestException('Non-SUPER_ADMIN users must have a valid tenantId');
        }
        console.log(`🔒 Regular user access: Fetching users for tenant ${tenantId}`);
        const whereClause = { tenantId };
        if (roleFilter) {
            whereClause.role = roleFilter;
            console.log(`   Filtering by role: ${roleFilter}`);
        }
        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, tenantId, role) {
        try {
            if (role === 'SUPER_ADMIN') {
                const user = await this.prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        tenantId: true,
                        tenant: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        createdAt: true,
                    },
                });
                if (!user) {
                    throw new common_1.NotFoundException(`User with ID ${id} not found`);
                }
                return user;
            }
            if (!tenantId) {
                throw new common_1.BadRequestException('Non-SUPER_ADMIN users must have a valid tenantId');
            }
            const user = await this.prisma.user.findFirst({
                where: { id, tenantId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    tenantId: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found in your organization`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            console.error('Error finding user:', error);
            throw new common_1.NotFoundException(`Unable to find user with ID ${id}`);
        }
    }
    async update(id, tenantId, role, updateUserDto) {
        await this.findOne(id, tenantId, role);
        const updateData = { ...updateUserDto };
        if (updateUserDto.password && updateUserDto.password.trim() !== '') {
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateUserDto.password, salt);
        }
        else {
            delete updateData.password;
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
    }
    async remove(id, tenantId, role) {
        await this.findOne(id, tenantId, role);
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'User successfully removed from organization' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map