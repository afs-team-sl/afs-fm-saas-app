// src/modules/users/dto/update-user.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto: 
 * 1. OmitType: We take CreateUserDto but remove 'password' 
 *    because updating passwords should be done via a secure dedicated endpoint.
 * 2. PartialType: We make all remaining fields (email, firstName, lastName, role) 
 *    optional, so the user can update only what they want.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}