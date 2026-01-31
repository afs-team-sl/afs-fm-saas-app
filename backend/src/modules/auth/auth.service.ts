import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Public registration logic: Creates a new Tenant and its first ADMIN user.
   * NOTE: NEVER creates SUPER_ADMIN - only regular tenant ADMIN users.
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
        },
      });

      // Create the primary ADMIN user linked to the tenant
      // IMPORTANT: Public registration NEVER creates SUPER_ADMIN
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN', // Always ADMIN for public registration
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
      userId: result.user.id,
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
   * Supports both:
   * - Regular users (with tenantId)
   * - SUPER_ADMIN users (tenantId: null)
   */
  async login(email: string, pass: string) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Compare the provided password with the stored hash
    if (user && (await bcrypt.compare(pass, user.password))) {
      // 3. Generate JWT Payload
      // IMPORTANT: tenantId can be null for SUPER_ADMIN
      const payload = { 
        sub: user.id, 
        email: user.email, 
        tenantId: user.tenantId, // null for SUPER_ADMIN
        role: user.role,
        userId: user.id,
      };
      
      console.log('🔐 LOGIN SUCCESS');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Tenant ID:', user.tenantId || 'null (SUPER_ADMIN)');
      
      // 4. Return the Token along with necessary user metadata for Frontend
      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId, // null for SUPER_ADMIN
        }
      };
    }
    
    throw new UnauthorizedException('Invalid email or password');
  }

  /**
   * Join Organization: Allows users to join an existing organization using a join code.
   */
  async joinOrganization(dto: JoinOrganizationDto) {
    const { joinCode, email, password, firstName, lastName, role } = dto;

    // 1. Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Find the organization by join code
    const tenant = await this.prisma.tenant.findUnique({
      where: { joinCode },
    });

    if (!tenant) {
      throw new NotFoundException('Invalid join code. Organization not found.');
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user linked to the organization
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || UserRole.TECHNICIAN, // Default to TECHNICIAN if not specified
        tenantId: tenant.id,
      },
    });

    // 5. Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    return {
      message: `Successfully joined ${tenant.name}`,
      access_token: await this.jwtService.signAsync(payload),
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}