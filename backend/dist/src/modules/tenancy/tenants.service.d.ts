import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationType } from '@prisma/client';
export declare class TenantsService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    findAll(): Promise<({
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        name: string;
        joinCode: string;
        domain: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        name: string;
        joinCode: string;
        domain: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        name: string;
    }): Promise<{
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        name: string;
        joinCode: string;
        domain: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    generateImpersonationToken(tenantId: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string;
        };
        tenant: {
            id: string;
            name: string;
        };
    }>;
    createBroadcast(message: string, type?: NotificationType): Promise<{
        message: string;
        notification: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            message: string;
            isActive: boolean;
            expiresAt: Date | null;
        };
    }>;
    getActiveNotifications(): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        isActive: boolean;
        expiresAt: Date | null;
    }[]>;
}
