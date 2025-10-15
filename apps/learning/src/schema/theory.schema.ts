import { TheoryType } from '@app/constracts/common/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { Unit } from './unit.schema';

export type TheoryDocument = HydratedDocument<Theory>;

@Schema({ collection: 'theories' })
export class Theory extends Document<ObjectId> {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Unit.name, required: true })
  unitId: Unit | ObjectId | string;

  @Prop({ type: String })
  title?: string; // tiêu đề (type=GRAMMAR)

  @Prop({ type: String })
  content?: string; // nội dung (type=GRAMMAR)

  @Prop({ type: String })
  example?: string; // ví dụ (type=GRAMMAR)

  @Prop({ type: String })
  audio?: string; // đường dẫn file âm thanh (type=PHRASE, FLASH_CARD)

  @Prop({ type: String })
  translation?: string; // nghĩa tiếng việt (type=PHRASE, FLASH_CARD)

  @Prop({ type: String })
  phraseText?: string; // câu gốc (type=PHRASE)

  @Prop({ type: String })
  term?: string; // từ vựng (type=FLASH_CARD)

  @Prop({ type: String })
  image?: string; // đường dẫn file ảnh (type=FLASH_CARD)

  @Prop({ type: String })
  ipa?: string; // phiên âm (type=FLASH_CARD)

  @Prop({ type: String })
  partOfSpeech?: string; // loại từ (type=FLASH_CARD) - noun, verb, adj...

  @Prop({ type: Number, required: true })
  displayOrder: number; // thứ tự hiển thị trong unit

  @Prop({ type: String, required: true })
  typeTheory: TheoryType;
}

const theorySchema = SchemaFactory.createForClass(Theory);

theorySchema.index({
  title: 'text',
  content: 'text',
  example: 'text',
  translation: 'text',
  phraseText: 'text',
  term: 'text',
  partOfSpeech: 'text',
});
theorySchema.index({ unitId: 1, displayOrder: 1 }, { unique: true });
theorySchema.plugin(mongooseTimestamp);

export { theorySchema };
