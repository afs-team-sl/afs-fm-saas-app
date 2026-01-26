import { MaintenancePlansService } from './maintenance-plans.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
export declare class MaintenancePlansController {
    private readonly maintenancePlansService;
    constructor(maintenancePlansService: MaintenancePlansService);
    create(createMaintenancePlanDto: CreateMaintenancePlanDto, req: any): Promise<{
        asset: {
            id: string;
            name: string;
            category: string;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
    }>;
    findAll(req: any): Promise<({
        asset: {
            id: string;
            name: string;
            category: string;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        asset: {
            id: string;
            name: string;
            category: string;
            status: import(".prisma/client").$Enums.AssetStatus;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
    }>;
    update(id: string, updateMaintenancePlanDto: UpdateMaintenancePlanDto, req: any): Promise<{
        asset: {
            id: string;
            name: string;
            category: string;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        assetId: string;
        tenantId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    triggerGeneration(id: string, req: any): Promise<{
        workOrder: {
            asset: {
                name: string;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            completionNote: string | null;
            assignedToId: string | null;
        };
        updatedPlan: {
            asset: {
                id: string;
                name: string;
                category: string;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
            nextDueDate: Date;
            lastGeneratedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            assetId: string;
            tenantId: string;
        };
    }>;
}
