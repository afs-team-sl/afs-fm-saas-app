// src/modules/work-orders/dto/create-work-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { WorkOrderPriority } from '@prisma/client';

export class CreateWorkOrderDto {
  @ApiProperty({
    description: 'Title of the work order',
    example: 'Fix broken HVAC system in Conference Room A',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the work order',
    example: 'The HVAC system is not cooling properly. Temperature is 28°C and should be 22°C.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Priority level of the work order',
    enum: WorkOrderPriority,
    example: WorkOrderPriority.HIGH,
    default: WorkOrderPriority.MEDIUM,
  })
  @IsEnum(WorkOrderPriority)
  @IsNotEmpty()
  priority: WorkOrderPriority;

  @ApiProperty({
    description: 'UUID of the asset this work order is related to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({
    description: 'UUID of the technician (User) assigned to this work order',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  // IMPORTANT: tenantId is removed from here because it must be passed 
  // via the 'x-tenant-id' header for security and data isolation.
}