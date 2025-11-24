import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { Question } from './question.schema';
import { Unit } from './unit.schema';

export type MistakeDocument = HydratedDocument<Mistake>;

@Schema({ collection: 'mistakes' })
export class Mistake extends Document<ObjectId> {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  userId: string | ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name, required: true })
  unitId: Unit | ObjectId | string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Question.name, required: true })
  questionId: Question | ObjectId | string;
}

const mistakeSchema = SchemaFactory.createForClass(Mistake);
mistakeSchema.index({ userId: 1, unitId: 1, questionId: 1 }, { unique: true });

mistakeSchema.plugin(mongooseTimestamp);

export { mistakeSchema };
