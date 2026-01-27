import { TenantsService } from './tenants.service';
import { NotificationType } from '@prisma/client';
declare class UpdateTenantDto {
    name: string;
}
declare class BroadcastDto {
    message: string;
    type?: NotificationType;
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
            tenantId: string;
        };
        tenant: {
            id: string;
            name: string;
        };
    }>;
    broadcastMessage(req: any, broadcastDto: BroadcastDto): Promise<{
        message: string;
        notification: {
            id: string;
            createdAt: Date;
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            isActive: boolean;
            expiresAt: Date | null;
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
export {};
