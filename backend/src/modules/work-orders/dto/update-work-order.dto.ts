// src/modules/work-orders/dto/update-work-order.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @ApiPropertyOptional({
    description: 'Updated title of the work order',
    example: 'Fix broken HVAC system in Conference Room A - URGENT',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the work order',
    example: 'The HVAC system has completely failed. Temperature is now 30°C.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the work order',
    enum: WorkOrderStatus,
    example: WorkOrderStatus.IN_PROGRESS,
  })
  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @ApiPropertyOptional({
    description: 'Updated priority level of the work order',
    enum: WorkOrderPriority,
    example: WorkOrderPriority.URGENT,
  })
  @IsEnum(WorkOrderPriority)
  @IsOptional()
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({
    description: 'Updated UUID of the technician assigned to this work order',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string; // Prisma Schema එකේ නමට සමාන කළා
}