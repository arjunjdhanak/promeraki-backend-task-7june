import { IsString, IsEnum, IsArray, ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConstituentDto {
  @IsString()
  partId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePartDto {
  @IsString()
  name: string;

  @IsEnum(['RAW', 'ASSEMBLED'])
  type: 'RAW' | 'ASSEMBLED';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstituentDto)
  @IsOptional()
  parts?: ConstituentDto[];
}