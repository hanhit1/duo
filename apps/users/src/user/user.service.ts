import { AppError, CreateUserDto, CRUDService, ErrorMessage, UpdateUserDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import * as bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';

dotenv.config();

@Injectable()
export class UserService extends CRUDService<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto): Promise<Result<User, AppError>> {
    try {
      const hashedPassword = createUserDto.password
        ? await bcrypt.hash(createUserDto.password, 10)
        : undefined;

      const model = new this.userModel({ ...createUserDto, password: hashedPassword });

      const user = await model.save();

      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_SAVING_USER,
        statusCode: 500,
        context: createUserDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Result<User, AppError>> {
    try {
      if (updateUserDto.password) {
        // Hash the new password before updating
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Find the user by ID and update the fields
      const user = await this.userModel.findOneAndUpdate({ _id: id }, updateUserDto, { new: true });

      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
        });
      }

      return ok(user as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_USER,
        statusCode: 500,
        context: updateUserDto,
        cause: e,
      });
    }
  }

  async updatePassword(email: string, newPassword: string): Promise<Result<User, AppError>> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await this.userModel.findOneAndUpdate(
        { email: email },
        { password: hashedPassword },
        { new: true, lean: true },
      );
      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
        });
      }
      return ok(user);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_USER,
        statusCode: 500,
        context: { email, newPassword },
        cause: e,
      });
    }
  }
}
