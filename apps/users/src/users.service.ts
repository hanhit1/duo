import { AppError, CreateUserDto, CRUDService, ErrorMessage, UpdateUserDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import * as bcrypt from 'bcrypt';
import { UpdateAccountDto } from '@app/constracts/users/dto/update-account.dto';
import { RoleDetailService } from './role-detail/role-detail.service';

dotenv.config();

@Injectable()
export class UsersService extends CRUDService<User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly roleDetailService: RoleDetailService,
  ) {
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

  async createAccountAdminWebsite(createUserDto: CreateUserDto): Promise<Result<User, AppError>> {
    try {
      const isExistOrError = await this.userModel.findOne({ email: createUserDto.email });
      if (isExistOrError) {
        return err({
          message: ErrorMessage.EMAIL_HAS_BEEN_EXISTED,
          statusCode: 400,
        });
      }

      delete createUserDto.streakCount;
      delete createUserDto.lastActiveAt;

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

  async updateAccountAdminWebsite(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Result<User, AppError>> {
    try {
      // Check if the account is an Admin account
      const isAdminRole = await this.roleDetailService.findOne({ name: 'Admin' });
      if (!isAdminRole.isOk() || !isAdminRole.value) {
        return err({
          message: 'Admin role not found',
          statusCode: 404,
        });
      }
      const isAdminAccount = await this.userModel.findOne({
        _id: id,
        roleId: isAdminRole.value._id,
      });
      if (isAdminAccount) {
        return err({
          message: ErrorMessage.CANNOT_UPDATE_ADMIN_ACCOUNT,
          statusCode: 403,
        });
      }
      // End Check if the account is an Admin account

      // Check email existence
      const isExistOrError = await this.userModel.findOne({
        email: updateAccountDto.email,
        _id: { $ne: id },
      });
      if (isExistOrError) {
        return err({
          message: ErrorMessage.EMAIL_HAS_BEEN_EXISTED,
          statusCode: 400,
        });
      }
      // End Check email existence

      if (updateAccountDto.password) {
        // Hash the new password before updating
        updateAccountDto.password = await bcrypt.hash(updateAccountDto.password, 10);
      }

      // Find the user by ID and update the fields
      const user = await this.userModel.findOneAndUpdate({ _id: id }, updateAccountDto, {
        new: true,
      });

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
        context: updateAccountDto,
        cause: e,
      });
    }
  }

  async deleteAccountAdminWebsite(id: string): Promise<Result<User, AppError>> {
    try {
      // get Admin role
      const roleAdmin = await this.roleDetailService.findOne({ name: 'Admin' });
      if (!roleAdmin.isOk() || !roleAdmin.value) {
        return err({
          message: 'Admin role not found',
          statusCode: 404,
        });
      }

      // only allow delete non-Admin account
      const user = await this.userModel.findOne({
        _id: id,
        roleId: { $ne: roleAdmin.value._id },
      });
      if (!user) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND_OR_TRYING_TO_DELETE_ADMIN,
          statusCode: 404,
        });
      }
      const removedUser = await this.userModel.findByIdAndDelete(id).exec();
      return ok(removedUser as User);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_REMOVING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }
}
