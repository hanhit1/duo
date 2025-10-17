import { QuestionType } from '@app/constracts/common/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { Lesson } from './lesson.schema';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ collection: 'questions' })
export class Question extends Document<ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Lesson.name, required: true })
  lessonId: Lesson | ObjectId | string;

  @Prop({ type: Array })
  leftText?: Array<string>; // type = MATCHING

  @Prop({ type: Array })
  rightText?: Array<string>; // type = MATCHING

  @Prop({ type: String })
  correctAnswer?: string; // type = MATCHING, MULTIPLE_CHOICE, GAP

  @Prop({ type: Array })
  fragmentText?: Array<string>; // type = ORDERING

  @Prop({ type: Array })
  exactFragmentText?: Array<string>; // type = ORDERING

  @Prop({ type: Array })
  answers?: Array<string>; // type = MULTIPLE_CHOICE

  @Prop({ type: String })
  mediaUrl?: string; // type = MULTIPLE_CHOICE, GAP

  @Prop({ type: Number, required: true })
  displayOrder: number;

  @Prop({ type: String, required: true })
  typeQuestion: QuestionType;
}

const questionSchema = SchemaFactory.createForClass(Question);

questionSchema.index({ lessonId: 1, displayOrder: 1 }, { unique: true });
questionSchema.plugin(mongooseTimestamp);

export { questionSchema };
