import { AccountRole } from '@app/constracts';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, HydratedDocument } from 'mongoose';
import * as mongooseTimestamp from 'mongoose-timestamp';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user' })
export class User extends Document<ObjectId> {
  @Prop({ type: String, required: true, default: AccountRole.User })
  role: AccountRole;

  @Prop(String)
  password: string;

  @Prop({ unique: true, sparse: true })
  email: string;

  @Prop(String)
  avatarImage?: string;
}

const userSchema = SchemaFactory.createForClass(User);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });

userSchema.plugin(mongooseTimestamp);

export { userSchema };
