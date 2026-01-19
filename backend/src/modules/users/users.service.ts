import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Ensure this DTO exists
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user with a hashed password
   */
  async create(tenantId: string, createUserDto: CreateUserDto) {
    // 1. Check if the email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. Create the user in the database
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // Store hashed password
        tenantId: tenantId,      // Ensure user is linked to the correct tenant
      },
      select: {
        // We exclude the password from the response for security
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
   * Find all users belonging to a specific tenant
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
   * Find a single user by ID and ensure they belong to the correct tenant
   */
  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found in your organization`);
    }

    return user;
  }

  /**
   * Update user details (scoped by tenantId)
   */
  async update(id: string, tenantId: string, updateUserDto: UpdateUserDto) {
    // Verify user exists in this tenant before updating
    await this.findOne(id, tenantId);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  /**
   * Delete a user (scoped by tenantId)
   */
  async remove(id: string, tenantId: string) {
    // Verify user exists in this tenant before deleting
    await this.findOne(id, tenantId);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}