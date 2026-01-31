import { NotificationType } from '@prisma/client';
export declare class UpdateGlobalNotificationDto {
    message?: string;
    type?: NotificationType;
    isActive?: boolean;
    expiresAt?: string;
}
