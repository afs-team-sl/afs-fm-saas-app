import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateMaintenancePlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])
  @IsNotEmpty()
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  @IsDateString()
  @IsNotEmpty()
  nextDueDate: string;

  @IsUUID()
  @IsNotEmpty()
  assetId: string;
}
