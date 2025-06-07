import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Constituent } from './constituent.schema';
import { PartType } from 'src/common/common.enums';

@Schema()
export class Part extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(PartType) })
  type: PartType;

  @Prop({ default: 0 })
  quantityInStock: number;

  @Prop({ type: [Constituent], default: undefined })
  constituents?: Constituent[];
}

export const PartSchema = SchemaFactory.createForClass(Part);