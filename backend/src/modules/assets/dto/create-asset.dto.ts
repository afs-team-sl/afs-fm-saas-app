// src/modules/assets/dto/create-asset.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty({
    description: 'Name of the asset',
    example: 'HVAC System - Conference Room A',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Category of the asset',
    example: 'HVAC',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({
    description: 'Serial number of the asset',
    example: 'SN-2024-HVAC-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  serialNo?: string;

  @ApiProperty({
    description: 'Status of the asset',
    enum: AssetStatus,
    example: AssetStatus.ACTIVE,
    default: AssetStatus.ACTIVE,
  })
  @IsEnum(AssetStatus)
  @IsNotEmpty()
  status: AssetStatus;

  @ApiPropertyOptional({
    description: 'Room ID where the asset is located',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  roomId?: string;

  // IMPORTANT: tenantId is removed from this DTO because it is 
  // provided via the 'x-tenant-id' header, not the request body.
}