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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { companyName, email, password, firstName, lastName } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await this.prisma.$transaction(async (prisma) => {
            const tenant = await prisma.tenant.create({
                data: {
                    name: companyName,
                },
            });
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });
            return { tenant, user };
        });
        const payload = {
            sub: result.user.id,
            email: result.user.email,
            tenantId: result.user.tenantId,
            role: result.user.role,
            userId: result.user.id,
        };
        return {
            message: 'Registration successful',
            access_token: await this.jwtService.signAsync(payload),
            tenant: {
                id: result.tenant.id,
                name: result.tenant.name,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                role: result.user.role,
                tenantId: result.user.tenantId,
            },
        };
    }
    async login(email, pass) {
        try {
            console.log('🔐 Login attempt for:', email);
            if (!email || !pass) {
                console.error('❌ Login failed: Missing email or password');
                throw new common_1.UnauthorizedException('Email and password are required');
            }
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                console.log('❌ Login failed: User not found:', email);
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const isPasswordValid = await bcrypt.compare(pass, user.password);
            if (!isPasswordValid) {
                console.log('❌ Login failed: Invalid password for:', email);
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            const payload = {
                sub: user.id,
                email: user.email,
                tenantId: user.tenantId,
                role: user.role,
                userId: user.id,
            };
            console.log('✅ LOGIN SUCCESS');
            console.log('   User ID:', user.id);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Tenant ID:', user.tenantId || 'null (SUPER_ADMIN)');
            let accessToken;
            try {
                accessToken = await this.jwtService.signAsync(payload);
            }
            catch (jwtError) {
                console.error('❌ JWT signing failed:', jwtError.message);
                throw new Error('Failed to generate authentication token. Check JWT_SECRET configuration.');
            }
            return {
                access_token: accessToken,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    tenantId: user.tenantId,
                }
            };
        }
        catch (error) {
            console.error('❌ Login error:', error.message);
            console.error('   Stack:', error.stack);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    async joinOrganization(dto) {
        const { joinCode, email, password, firstName, lastName, role } = dto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { joinCode },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Invalid join code. Organization not found.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || client_1.UserRole.TECHNICIAN,
                tenantId: tenant.id,
            },
        });
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        };
        return {
            message: `Successfully joined ${tenant.name}`,
            access_token: await this.jwtService.signAsync(payload),
            tenant: {
                id: tenant.id,
                name: tenant.name,
            },
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map