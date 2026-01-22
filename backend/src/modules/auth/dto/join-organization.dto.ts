// src/modules/auth/dto/join-organization.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class JoinOrganizationDto {
  @ApiProperty({ 
    example: 'clxyz123abc456def789', 
    description: 'Organization join code provided by admin' 
  })
  @IsNotEmpty()
  @IsString()
  joinCode: string;

  @ApiProperty({ example: 'tech@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 6 characters)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jane', description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ 
    example: 'TECHNICIAN', 
    description: 'User role (defaults to TECHNICIAN if not provided)',
    enum: UserRole,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
