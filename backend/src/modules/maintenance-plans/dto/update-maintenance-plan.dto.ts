import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateMaintenancePlanDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'])
  @IsOptional()
  frequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

  @IsDateString()
  @IsOptional()
  nextDueDate?: string;
}
