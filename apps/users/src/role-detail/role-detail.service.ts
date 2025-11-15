import { AppError, CRUDService, ErrorMessage } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { RoleDetail } from '../schema/role-detail.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateNameOfRoleDto } from '@app/constracts/users/dto/update-roleDetail.dto';
import { err, ok, Result } from 'neverthrow';

// describe all method in here: add new role, update role, delete role, get role by id, get all roles
@Injectable()
export class RoleDetailService extends CRUDService<RoleDetail> {
  constructor(@InjectModel(RoleDetail.name) private readonly roleDetailModel: Model<RoleDetail>) {
    super(roleDetailModel);
  }

  async handleRoleSetup(rolePermissions: { id: string; permissions: string[] }[]): Promise<void> {
    for (const rp of rolePermissions) {
      await this.roleDetailModel.updateOne(
        { _id: rp.id },
        { $set: { permissions: rp.permissions } },
      );
    }
  }

  async updateNameRole(
    id: string,
    updateDto: UpdateNameOfRoleDto,
  ): Promise<Result<RoleDetail, AppError>> {
    try {
      // check admin update role name of Admin to other name
      const role = await this.roleDetailModel.findById(id).exec();
      if (role && role.name.toLocaleLowerCase() === 'admin') {
        return err({
          message: ErrorMessage.CANNOT_CHANGE_ADMIN_ROLE_NAME,
          statusCode: 400,
        });
      }
      const updatedModel = await this.roleDetailModel
        .findByIdAndUpdate(id, updateDto, { new: true })
        .exec();
      if (!updatedModel) {
        return err({
          message: ErrorMessage.MODEL_NOT_FOUND,
          statusCode: 404,
        });
      }
      return ok(updatedModel.toObject() as RoleDetail);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_UPDATING_MODEL,
        statusCode: 500,
        context: updateDto,
        cause: e,
      });
    }
  }

  async deleteRole(id: string): Promise<Result<RoleDetail, AppError>> {
    try {
      const isAdminRole = await this.roleDetailModel.findOne({ name: 'Admin' });
      if (isAdminRole && isAdminRole._id.toString() === id) {
        return err({
          message: ErrorMessage.CANNOT_DELETE_ADMIN_ROLE,
          status: 403,
        });
      }

      const removedModel = await this.roleDetailModel.findByIdAndDelete(id).exec();

      if (!removedModel) {
        return err({
          message: ErrorMessage.MODEL_NOT_FOUND,
          statusCode: 404,
        });
      }

      return ok(removedModel as RoleDetail);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_REMOVING_MODEL,
        statusCode: 500,
        cause: e,
      });
    }
  }
}
