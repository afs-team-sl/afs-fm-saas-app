// src/modules/users/dto/update-user.dto.ts
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, MinLength } from 'class-validator';

/**
 * UpdateUserDto: 
 * Extends CreateUserDto but makes all fields optional.
 * Password updates are allowed and will be hashed before saving.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'New password for the user account (minimum 8 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}