import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Public registration logic: Creates a new Tenant and its first ADMIN user.
   */
  async register(registerDto: RegisterDto) {
    const { companyName, email, password, firstName, lastName } = registerDto;

    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash the password (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Use a transaction to ensure atomic creation of Tenant and User
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create Tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: companyName,
          // You can also add a domain here if needed
        },
      });

      // Create the primary ADMIN user linked to the tenant
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    // 4. Generate JWT payload
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.user.tenantId,
      role: result.user.role,
    };

    return {
      message: 'Registration successful',
      access_token: await this.jwtService.signAsync(payload),
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        tenantId: result.user.tenantId,
      },
    };
  }

  /**
   * Login logic: Authenticates user and returns JWT + User Metadata
   */
  async login(email: string, pass: string) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Compare the provided password with the stored hash
    if (user && (await bcrypt.compare(pass, user.password))) {
      // 3. Generate JWT Payload
      const payload = { 
        sub: user.id, 
        email: user.email, 
        tenantId: user.tenantId, 
        role: user.role 
      };
      
      // 4. Return the Token along with necessary user metadata for Frontend 🚀
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        }
      };
    }
    
    throw new UnauthorizedException('Invalid email or password');
  }
}