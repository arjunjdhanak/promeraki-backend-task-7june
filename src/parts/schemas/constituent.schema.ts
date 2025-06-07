import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Constituent {
  @Prop({ required: true })
  partId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;
}