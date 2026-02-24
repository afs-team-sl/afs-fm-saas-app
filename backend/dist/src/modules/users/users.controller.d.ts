import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(req: any, createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string | null;
        createdAt: Date;
    }>;
    findAll(req: any, roleFilter?: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string | null;
        createdAt: Date;
    }>;
    update(id: string, req: any, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
