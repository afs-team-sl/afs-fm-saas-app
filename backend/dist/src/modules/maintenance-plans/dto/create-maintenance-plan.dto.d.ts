export declare class CreateMaintenancePlanDto {
    title: string;
    description?: string;
    frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    nextDueDate: string;
    assetId: string;
}
