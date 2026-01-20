import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        createdAt: Date;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, tenantId: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string, tenantId: string): Promise<{
        message: string;
    }>;
}
