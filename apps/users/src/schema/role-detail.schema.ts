import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
export type RoleDetailDocument = HydratedDocument<RoleDetail>;

@Schema({ collection: 'role-details' })
export class RoleDetail extends Document<ObjectId> {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: [String], required: true, default: [] })
  permissions: string[];
}

const roleDetailSchema = SchemaFactory.createForClass(RoleDetail);
roleDetailSchema.index({ name: 1 }, { unique: true });

roleDetailSchema.plugin(mongooseTimestamp);

export { roleDetailSchema };
