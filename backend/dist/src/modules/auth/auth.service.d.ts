import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JoinOrganizationDto } from './dto/join-organization.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        access_token: string;
        tenant: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string | null;
        };
    }>;
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string | null;
        };
    }>;
    joinOrganization(dto: JoinOrganizationDto): Promise<{
        message: string;
        access_token: string;
        tenant: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string | null;
        };
    }>;
}
