import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ collection: 'courses' })
export class Course extends Document<ObjectId> {
  @Prop({ type: String })
  description?: string;

  @Prop({ unique: true, sparse: true, required: true })
  displayOrder: number;

  @Prop(String)
  thumbnail?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

const courseSchema = SchemaFactory.createForClass(Course);

courseSchema.index({ description: 'text' });

courseSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'courseId',
});

courseSchema.plugin(mongooseTimestamp);

export { courseSchema };
