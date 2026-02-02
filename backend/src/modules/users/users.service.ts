import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user with a hashed password.
   * Scoped to a specific tenant for SaaS data isolation.
   */
  async create(tenantId: string, createUserDto: CreateUserDto) {
    // 1. Check if the email already exists globally
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. Create the user
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        tenantId: tenantId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  /**
   * Find all users.
   * - SUPER_ADMIN (role === 'SUPER_ADMIN'): Returns ALL users across all tenants
   * - Regular users: Returns only users in their organization (filtered by tenantId)
   * @param roleFilter - Optional filter to return only users with a specific role (e.g., 'TECHNICIAN')
   */
  async findAll(tenantId: string | null, role: string, roleFilter?: string) {
    // SUPER_ADMIN can see all users across all organizations
    if (role === 'SUPER_ADMIN') {
      console.log('🔓 SUPER_ADMIN access: Fetching ALL users across all tenants');
      
      const whereClause: any = {};
      if (roleFilter) {
        whereClause.role = roleFilter;
        console.log(`   Filtering by role: ${roleFilter}`);
      }
      
      return this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          tenant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { tenantId: 'asc' }, // Group by organization
          { createdAt: 'desc' },
        ],
      });
    }

    // Regular users must have a tenantId
    if (!tenantId) {
      throw new BadRequestException('Non-SUPER_ADMIN users must have a valid tenantId');
    }

    console.log(`🔒 Regular user access: Fetching users for tenant ${tenantId}`);

    // Build where clause with tenantId and optional role filter
    const whereClause: any = { tenantId };
    if (roleFilter) {
      whereClause.role = roleFilter;
      console.log(`   Filtering by role: ${roleFilter}`);
    }

    // Return only users in the same organization
    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find a single user by ID.
   * - SUPER_ADMIN: Can view any user (no tenant restriction)
   * - Regular users: Can only view users in their organization
   */
  async findOne(id: string, tenantId: string | null, role: string) {
    try {
      // SUPER_ADMIN can view any user
      if (role === 'SUPER_ADMIN') {
        const user = await this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            tenantId: true,
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
          },
        });

        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
      }

      // Regular users must have a tenantId and can only see users in their org
      if (!tenantId) {
        throw new BadRequestException('Non-SUPER_ADMIN users must have a valid tenantId');
      }

      const user = await this.prisma.user.findFirst({
        where: { id, tenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found in your organization`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Log the error for debugging but throw a user-friendly message
      console.error('Error finding user:', error);
      throw new NotFoundException(`Unable to find user with ID ${id}`);
    }
  }

  /**
   * Update user details.
   * Handles password hashing if a new password is provided in the update.
   * NOTE: Regular users can only update users in their organization.
   */
  async update(id: string, tenantId: string | null, role: string, updateUserDto: UpdateUserDto) {
    // 1. First, verify the user exists and belongs to the requester's tenant
    await this.findOne(id, tenantId, role);

    // 2. Prepare data for update
    const updateData: any = { ...updateUserDto };

    // 3. Check if password is being updated. If yes, hash it! 🔐
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateUserDto.password, salt);
    } else {
      // If password is empty or not provided, remove it from update object
      delete updateData.password;
    }

    // 4. Execute the update in database
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  }

  /**
   * Delete a user.
   * NOTE: Regular users can only delete users in their organization.
   */
  async remove(id: string, tenantId: string | null, role: string) {
    // Verify user exists in this tenant before deleting
    await this.findOne(id, tenantId, role);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User successfully removed from organization' };
  }
}