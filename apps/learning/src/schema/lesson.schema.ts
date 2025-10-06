import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument, Types } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ collection: 'lessons' })
export class Lesson extends Document<ObjectId> {
  @Prop({ type: Types.ObjectId, ref: 'Unit', required: true })
  unitId: Types.ObjectId;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  objectives?: string;

  @Prop({ required: true })
  displayOrder: number;

  @Prop(String)
  thumbnail?: string;
}

const lessonSchema = SchemaFactory.createForClass(Lesson);

lessonSchema.index({ title: 'text', objectives: 'text' });
lessonSchema.index({ unitId: 1, displayOrder: 1 }, { unique: true });

lessonSchema.plugin(mongooseTimestamp);

export { lessonSchema };
