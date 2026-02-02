import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createUserDto: CreateUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string | null;
    }>;
    findAll(tenantId: string | null, role: string, roleFilter?: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string, tenantId: string | null, role: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string | null;
    }>;
    update(id: string, tenantId: string | null, role: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string, tenantId: string | null, role: string): Promise<{
        message: string;
    }>;
}
