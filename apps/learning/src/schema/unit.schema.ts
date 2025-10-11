import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { Course } from './course.schema';

export type UnitDocument = HydratedDocument<Unit>;

@Schema({ collection: 'units' })
export class Unit extends Document<ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course.name, required: true })
  courseId: Course | ObjectId | string;

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

unitSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'unitId',
});

unitSchema.plugin(mongooseTimestamp);

export { unitSchema };
