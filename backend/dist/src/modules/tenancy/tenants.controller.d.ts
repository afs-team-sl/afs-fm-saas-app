import { TenantsService } from './tenants.service';
declare class UpdateTenantDto {
    name: string;
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
    : any;
}
export {};
