import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    private readonly SUPER_TENANT_ID;
    findAll(req: any): Promise<({
        _count: {
            users: number;
            assets: number;
            workOrders: number;
        };
    } & {
        id: string;
        name: string;
        domain: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
