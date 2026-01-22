import { UserRole } from '@prisma/client';
export declare class JoinOrganizationDto {
    joinCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
