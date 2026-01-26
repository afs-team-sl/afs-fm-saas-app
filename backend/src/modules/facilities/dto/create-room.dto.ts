import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string; // e.g., "Server Room", "Office 101"

  @IsUUID()
  @IsNotEmpty()
  floorId: string;
}
