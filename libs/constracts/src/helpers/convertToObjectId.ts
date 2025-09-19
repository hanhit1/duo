import { Types } from 'mongoose';

export function convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
  return new Types.ObjectId(id);
}
