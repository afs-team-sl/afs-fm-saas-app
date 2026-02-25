// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'The unique email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password for the account (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'The role assigned to the user within the system',
    enum: UserRole,
    example: UserRole.ADMIN,
    default: UserRole.OCCUPANT,
  })
  @IsEnum(UserRole)
  role: UserRole;

  // PHASE 6: Enterprise User Fields
  @ApiPropertyOptional({
    description: 'Job title or position of the user',
    example: 'Senior Facilities Manager',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  jobTitle?: string;

  // IMPORTANT: tenantId is removed from here because it should be 
  // passed via 'x-tenant-id' header, not the request body.
}