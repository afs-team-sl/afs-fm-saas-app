import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFloorDto {
  @IsString()
  @IsNotEmpty()
  number: string; // e.g., "Level 1", "Ground Floor"

  @IsUUID()
  @IsNotEmpty()
  buildingId: string;
}
