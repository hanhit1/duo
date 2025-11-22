import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';
import { RoleDetail } from './role-detail.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user' })
export class User extends Document<ObjectId> {
  @Prop({ type: String, required: true })
  password: string;

  @Prop({ unique: true, sparse: true, required: true })
  email: string;

  @Prop(String)
  avatarImage?: string;

  @Prop(String)
  fullName: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, required: false })
  streakCount: number;

  @Prop({ type: Date, required: false })
  lastActiveAt: Date;

  @Prop({ type: Number, required: false })
  experiencePoint: number;

  @Prop({ type: Number, required: false })
  heartCount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: RoleDetail.name, required: true })
  roleId: ObjectId | string;
}

const userSchema = SchemaFactory.createForClass(User);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });

userSchema.plugin(mongooseTimestamp);

export { userSchema };
