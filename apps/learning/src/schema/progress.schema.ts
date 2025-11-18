import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { Course } from './course.schema';
import { Unit } from './unit.schema';
import { Lesson } from './lesson.schema';

export type ProgressDocument = HydratedDocument<Progress>;

@Schema({ collection: 'progress' })
export class Progress extends Document<ObjectId> {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    index: true,
  })
  user: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Lesson.name, required: true })
  lesson: Lesson | ObjectId | string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name, required: true })
  unit: Unit | ObjectId | string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course.name, required: true })
  course: Course | ObjectId | string;
}

const progressSchema = SchemaFactory.createForClass(Progress);

progressSchema.plugin(mongooseTimestamp);

export { progressSchema };
