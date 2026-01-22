import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
   * Find all users belonging to a specific tenant.
   */
  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
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
   * Find a single user by ID and ensure they belong to the correct tenant.
   */
  async findOne(id: string, tenantId: string) {
    try {
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
      if (error instanceof NotFoundException) {
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
   */
  async update(id: string, tenantId: string, updateUserDto: UpdateUserDto) {
    // 1. First, verify the user exists and belongs to the requester's tenant
    await this.findOne(id, tenantId);

    // 2. Prepare data for update
    const updateData: any = { ...updateUserDto };

    // 3. Check if password is being updated. If yes, hash it! 🔐
    // We use type casting to ensure TypeScript allows access to the password field.
    const rawPassword = (updateUserDto as any).password;
    
    if (rawPassword && rawPassword.trim() !== '') {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(rawPassword, salt);
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
   * Delete a user (scoped by tenantId).
   */
  async remove(id: string, tenantId: string) {
    // Verify user exists in this tenant before deleting
    await this.findOne(id, tenantId);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User successfully removed from organization' };
  }
}