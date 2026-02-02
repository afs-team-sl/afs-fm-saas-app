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
    try {
      console.log('🔐 Login attempt for:', email);

      // Validate input
      if (!email || !pass) {
        console.error('❌ Login failed: Missing email or password');
        throw new UnauthorizedException('Email and password are required');
      }

      // 1. Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('❌ Login failed: User not found:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      // 2. Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      
      if (!isPasswordValid) {
        console.log('❌ Login failed: Invalid password for:', email);
        throw new UnauthorizedException('Invalid email or password');
      }

      // 3. Generate JWT Payload
      // IMPORTANT: tenantId can be null for SUPER_ADMIN
      const payload = { 
        sub: user.id, 
        email: user.email, 
        tenantId: user.tenantId, // null for SUPER_ADMIN
        role: user.role,
        userId: user.id,
      };
      
      console.log('✅ LOGIN SUCCESS');
      console.log('   User ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Tenant ID:', user.tenantId || 'null (SUPER_ADMIN)');
      
      // 4. Generate JWT token
      let accessToken: string;
      try {
        accessToken = await this.jwtService.signAsync(payload);
      } catch (jwtError) {
        console.error('❌ JWT signing failed:', jwtError.message);
        throw new Error('Failed to generate authentication token. Check JWT_SECRET configuration.');
      }

      // 5. Return the Token along with necessary user metadata for Frontend
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId, // null for SUPER_ADMIN
        }
      };
    } catch (error) {
      // Log detailed error for debugging
      console.error('❌ Login error:', error.message);
      console.error('   Stack:', error.stack);
      
      // Re-throw known errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new Error(`Login failed: ${error.message}`);
    }
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