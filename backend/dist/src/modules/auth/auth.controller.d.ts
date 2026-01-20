import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        access_token: string;
        tenant: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string;
        };
    }>;
    signIn(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.UserRole;
            tenantId: string;
        };
    }>;
}
