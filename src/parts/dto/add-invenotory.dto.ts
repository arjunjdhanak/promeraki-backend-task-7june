import { IsInt, Min } from 'class-validator';

export class AddInventoryDto {
  @IsInt()
  @Min(1)
  quantity: number;
}