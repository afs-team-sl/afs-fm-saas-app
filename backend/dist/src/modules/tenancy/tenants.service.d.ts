import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AnnouncementType, SubscriptionPlan } from '@prisma/client';
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        joinCode: string;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        maxAssets: number;
        domain: string | null;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        joinCode: string;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        maxAssets: number;
        domain: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        name: string;
        joinCode: string;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        maxAssets: number;
        domain: string | null;
    }>;
    generateImpersonationToken(tenantId: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string | null;
        };
        tenant: {
            id: string;
            name: string;
        };
    }>;
    updatePlan(id: string, plan: SubscriptionPlan, maxAssets: number): Promise<{
        message: string;
        tenant: {
            _count: {
                users: number;
                assets: number;
                workOrders: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            joinCode: string;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            maxAssets: number;
            domain: string | null;
        };
    }>;
    createAnnouncement(message: string, type?: AnnouncementType): Promise<{
        message: string;
        announcement: {
            id: string;
            tenantId: string | null;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            type: import(".prisma/client").$Enums.AnnouncementType;
            isActive: boolean;
        };
    }>;
    getActiveAnnouncements(tenantId: string | null): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.AnnouncementType;
        isActive: boolean;
    }[]>;
    deleteAnnouncement(id: string): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
        deletedCounts: {
            users: number;
            assets: number;
            workOrders: number;
        };
    }>;
    getActiveNotifications(): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        isActive: boolean;
        expiresAt: Date | null;
    }[]>;
}
