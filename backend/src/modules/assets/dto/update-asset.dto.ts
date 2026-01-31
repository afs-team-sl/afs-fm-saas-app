import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class UpdateAssetDto {
  @ApiPropertyOptional({
    description: 'Updated name of the asset',
    example: 'HVAC System - Conference Room A (Updated)',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated category of the asset',
    example: 'HVAC',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Updated serial number of the asset',
    example: 'SN-2024-HVAC-001-REV2',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  serialNo?: string;

  @ApiPropertyOptional({
    description: 'Updated status of the asset',
    enum: AssetStatus,
    example: AssetStatus.MAINTENANCE,
  })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @ApiPropertyOptional({
    description: 'Room ID where the asset is located',
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  roomId?: string;

  // Advanced HVAC/Mechanical Fields
  @ApiPropertyOptional({
    description: 'Updated site location',
    example: 'Main Campus',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  site?: string;

  @ApiPropertyOptional({
    description: 'Updated specific location',
    example: 'Building A - Roof',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Updated custom ID',
    example: 'HVAC-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  customId?: string;

  @ApiPropertyOptional({
    description: 'Updated asset number',
    example: 'A-2024-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  assetNumber?: string;

  @ApiPropertyOptional({
    description: 'Updated manufacturer',
    example: 'Carrier',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Updated model number',
    example: '30RB-080',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  modelNumber?: string;

  @ApiPropertyOptional({
    description: 'Updated year of installation',
    example: 2020,
  })
  @IsOptional()
  installYear?: number;

  @ApiPropertyOptional({
    description: 'Updated filter size',
    example: '20x25x4',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  filterSize?: string;

  @ApiPropertyOptional({
    description: 'Updated belt size',
    example: 'B-54',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  beltSize?: string;

  @ApiPropertyOptional({
    description: 'Updated notes',
    example: 'Requires quarterly maintenance',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
