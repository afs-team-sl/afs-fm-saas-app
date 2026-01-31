import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateGlobalNotificationDto {
  @ApiProperty({
    description: 'The notification message',
    example: 'System maintenance scheduled for tomorrow at 2 AM EST',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: 'INFO',
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiProperty({
    description: 'Whether the notification is currently active',
    example: true,
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
