import { ApiProperty } from "@nestjs/swagger";
import { PartType } from "src/common/common.enums";

export class CreatePartDto {
    @ApiProperty({required: true})
    name: string;
    
    @ApiProperty({required: true, enum: Object.values(PartType) })
    type: PartType;
}
