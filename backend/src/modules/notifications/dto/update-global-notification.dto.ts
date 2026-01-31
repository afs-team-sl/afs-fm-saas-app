import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class UpdateGlobalNotificationDto {
  @ApiProperty({
    description: 'The notification message',
    example: 'System maintenance rescheduled',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'WARNING',
    required: false,
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    description: 'Whether the notification is currently active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Optional expiration date for the notification (ISO 8601)',
    example: '2026-02-15T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
