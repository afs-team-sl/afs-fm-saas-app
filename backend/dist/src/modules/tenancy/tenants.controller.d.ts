import { TenantsService } from './tenants.service';
import { AnnouncementType, SubscriptionPlan } from '@prisma/client';
declare class UpdateTenantDto {
    name: string;
}
declare class UpdateTenantPlanDto {
    plan: SubscriptionPlan;
    maxAssets: number;
}
declare class BroadcastDto {
    message: string;
    type?: AnnouncementType;
}
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getCurrentTenant(req: any): Promise<{
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
    updateCurrentTenant(req: any, updateTenantDto: UpdateTenantDto): Promise<{
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
    findAll(req: any): Promise<({
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
    impersonateTenant(req: any, tenantId: string): Promise<{
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
    updateTenantPlan(req: any, tenantId: string, updatePlanDto: UpdateTenantPlanDto): Promise<{
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
    broadcastMessage(req: any, broadcastDto: BroadcastDto): Promise<{
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
    getActiveAnnouncements(req: any): Promise<{
        id: string;
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: import(".prisma/client").$Enums.AnnouncementType;
        isActive: boolean;
    }[]>;
    deleteAnnouncement(req: any, announcementId: string): Promise<{
        message: string;
    }>;
    deleteTenant(req: any, tenantId: string): Promise<{
        message: string;
        deletedCounts: {
            users: number;
            assets: number;
            workOrders: number;
        };
    }>;
}
export {};
