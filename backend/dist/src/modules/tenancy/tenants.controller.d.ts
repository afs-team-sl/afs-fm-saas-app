import { TenantsService } from './tenants.service';
import { AnnouncementType } from '@prisma/client';
declare class UpdateTenantDto {
    name: string;
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
        name: string;
        joinCode: string;
        domain: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCurrentTenant(req: any, updateTenantDto: UpdateTenantDto): Promise<{
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
    findAll(req: any): Promise<({
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
    broadcastMessage(req: any, broadcastDto: BroadcastDto): Promise<{
        message: string;
        announcement: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            message: string;
            type: import(".prisma/client").$Enums.AnnouncementType;
            isActive: boolean;
        };
    }>;
    getActiveAnnouncements(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
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
