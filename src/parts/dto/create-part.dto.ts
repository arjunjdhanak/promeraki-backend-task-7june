import { IsString, IsEnum, IsArray, ValidateNested, IsOptional, IsInt, Min, IsNotEmpty, ValidateIf, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { PartType } from 'src/common/common.enums';

export class ConstituentDto {
  @IsNotEmpty()
  @IsString()
  partId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePartDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(PartType)
  type: PartType;

  @ValidateIf((o) => o.type === PartType.ASSEMBLED)
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ConstituentDto)
  parts?: ConstituentDto[];
}