import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsString()
  partNumber: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockLevel?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  // PHASE 6: Enterprise Inventory Fields
  @IsString()
  @IsOptional()
  uom?: string; // Unit of Measurement

  @IsString()
  @IsOptional()
  location?: string; // Shelf/Bin location

  @IsString()
  @IsOptional()
  supplierId?: string; // Link to Supplier
}
