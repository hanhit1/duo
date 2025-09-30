import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ collection: 'lessons' })
export class Lesson extends Document<ObjectId> {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  unitId: ObjectId;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: String })
  objectives?: string;

  @Prop({ unique: true, sparse: true, required: true })
  displayOrder: number;

  @Prop(String)
  thumbnail?: string;
}

const lessonSchema = SchemaFactory.createForClass(Lesson);

lessonSchema.index({ title: 'text', objectives: 'text' });

lessonSchema.plugin(mongooseTimestamp);

export { lessonSchema };
