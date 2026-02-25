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

  // Advanced HVAC/Mechanical Fields
  @ApiPropertyOptional({
    description: 'Site location of the asset',
    example: 'Main Campus',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  site?: string;

  @ApiPropertyOptional({
    description: 'Specific location within site',
    example: 'Building A - Roof',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Custom ID for the asset',
    example: 'HVAC-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  customId?: string;

  @ApiPropertyOptional({
    description: 'Asset number',
    example: 'A-2024-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  assetNumber?: string;

  @ApiPropertyOptional({
    description: 'Manufacturer of the asset',
    example: 'Carrier',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Model number',
    example: '30RB-080',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  modelNumber?: string;

  @ApiPropertyOptional({
    description: 'Year of installation',
    example: 2020,
  })
  @IsOptional()
  installYear?: number;

  @ApiPropertyOptional({
    description: 'Filter size specification',
    example: '20x25x4',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  filterSize?: string;

  @ApiPropertyOptional({
    description: 'Belt size specification',
    example: 'B-54',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  beltSize?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the asset',
    example: 'Requires quarterly maintenance',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  // PHASE 6: Enterprise Asset Fields
  @ApiPropertyOptional({
    description: 'Department that owns the asset',
    example: 'Facilities Management',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  department?: string;

  @ApiPropertyOptional({
    description: 'Asset profile image URL',
    example: 'https://storage.azure.com/assets/hvac-001.jpg',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    description: 'Cost center code for financial tracking',
    example: 'CC-1000',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  costCenter?: string;

  // IMPORTANT: tenantId is removed from this DTO because it is 
  // provided via the 'x-tenant-id' header, not the request body.
}