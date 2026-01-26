export declare class UpdateMaintenancePlanDto {
    title?: string;
    description?: string;
    frequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    nextDueDate?: string;
}
