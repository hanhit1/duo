import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument, Types } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type UnitDocument = HydratedDocument<Unit>;

@Schema({ collection: 'units' })
export class Unit extends Document<ObjectId> {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ required: true })
  displayOrder: number;

  @Prop(String)
  thumbnail?: string;
}

const unitSchema = SchemaFactory.createForClass(Unit);

unitSchema.index({ title: 'text', description: 'text' });
unitSchema.index({ courseId: 1, displayOrder: 1 }, { unique: true });

unitSchema.plugin(mongooseTimestamp);

export { unitSchema };
