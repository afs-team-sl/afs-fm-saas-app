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
}
