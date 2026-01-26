import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
export declare class MaintenancePlansService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateMaintenancePlanDto, tenantId: string): Promise<{
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
    findAll(tenantId: string): Promise<({
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
    findOne(id: string, tenantId: string): Promise<{
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
    update(id: string, dto: UpdateMaintenancePlanDto, tenantId: string): Promise<{
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
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
    triggerManualGeneration(planId: string, tenantId: string): Promise<{
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
