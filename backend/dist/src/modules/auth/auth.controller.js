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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const swagger_1 = require("@nestjs/swagger");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const join_organization_dto_1 = require("./dto/join-organization.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async signIn(loginDto) {
        try {
            return await this.authService.login(loginDto.email, loginDto.password);
        }
        catch (error) {
            console.error('🚨 Login endpoint error:', error.message);
            throw error;
        }
    }
    async joinOrganization(joinDto) {
        return this.authService.joinOrganization(joinDto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new company and admin user' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Registration successful. Tenant and Admin user created.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict. User with this email already exists.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login to get JWT access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful. JWT token returned.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid email or password.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error. Check server configuration.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join an existing organization using a join code' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Successfully joined organization. User created and JWT returned.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Organization not found. Invalid join code.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict. User with this email already exists.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_organization_dto_1.JoinOrganizationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "joinOrganization", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map