import {
  AppError,
  CreateUserDto,
  CRUDService,
  ErrorMessage,
  PublicUser,
  UpdateUserDto,
} from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import * as bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
import { Cron } from '@nestjs/schedule';

dotenv.config();

@Injectable()
export class UserService extends CRUDService<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }

  async getProfile(userId: string): Promise<Result<User, AppError>> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('-password')
        .populate('roleId')
        .lean();
      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
        });
      }

      // check if is role user to reset heartCount daily
      const role = user.roleId as any;
      const nameRole = role?.name?.toUpperCase?.() || '';
      const lastActiveDate = new Date(user.lastActiveAt || '');
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastActiveDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (nameRole.toUpperCase() === 'USER' && dayDiff >= 1 && user.heartCount < 5) {
        await this.userModel.findByIdAndUpdate(userId, { heartCount: 5 });
        user.heartCount = 5;
      }
      return ok(user);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_FETCHING_USER,
        statusCode: 500,
        context: { userId },
        cause: e,
      });
    }
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

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Result<PublicUser, AppError>> {
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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, email, ...safeUser } = user.toObject();
      return ok(safeUser);
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

  @Cron('0 0 0 * * *')
  async handleDailyStreakJob(): Promise<void> {
    const today = new Date();

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const users = await this.userModel.find({ roleId: '691238dc19f785f28a7bf5cc' }).lean();

    for (const u of users) {
      if (u.lastActiveAt < yesterday) {
        await this.userModel.updateOne(
          { _id: u._id },
          {
            $set: {
              streakCount: 0,
            },
          },
        );
      }
    }
  }
}
