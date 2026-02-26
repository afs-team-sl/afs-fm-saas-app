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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        assetId: string;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        assetId: string;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
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
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        assetId: string;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
    }>;
    update(id: string, updateMaintenancePlanDto: UpdateMaintenancePlanDto, req: any): Promise<{
        asset: {
            id: string;
            name: string;
            category: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        assetId: string;
        frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
        nextDueDate: Date;
        lastGeneratedAt: Date | null;
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
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            priority: import(".prisma/client").$Enums.WorkOrderPriority;
            assetId: string;
            assignedToId: string | null;
            completionNote: string | null;
            startedAt: Date | null;
            dueDate: Date | null;
            laborHours: number | null;
            checklistData: import("@prisma/client/runtime/library").JsonValue | null;
            legacyId: string | null;
        };
        updatedPlan: {
            asset: {
                id: string;
                name: string;
                category: string;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            assetId: string;
            frequency: import(".prisma/client").$Enums.MaintenanceFrequency;
            nextDueDate: Date;
            lastGeneratedAt: Date | null;
        };
    }>;
}
