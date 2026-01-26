import { IsString, IsNumber, Min } from 'class-validator';

export class AddWorkOrderPartDto {
  @IsString()
  partId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
