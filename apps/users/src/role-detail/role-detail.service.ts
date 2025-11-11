import { CRUDService } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { RoleDetail } from '../schema/role-detail.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
}
