import { WorkOrderPriority } from '@prisma/client';
export declare class CreateWorkOrderDto {
    title: string;
    description?: string;
    priority: WorkOrderPriority;
    assetId: string;
    assignedToId?: string;
    checklistData?: any;
    legacyId?: string;
}
