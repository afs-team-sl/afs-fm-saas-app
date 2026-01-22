import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';
export declare class UpdateWorkOrderDto {
    title?: string;
    description?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    completionNote?: string;
    assignedToId?: string;
}
