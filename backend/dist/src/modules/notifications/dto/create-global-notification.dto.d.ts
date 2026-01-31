import { NotificationType } from '@prisma/client';
export declare class CreateGlobalNotificationDto {
    message: string;
    type?: NotificationType;
    isActive?: boolean;
    expiresAt?: string;
}
