import { Controller } from '@nestjs/common';

import { AppError } from '@app/constracts';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import { RoleDetailService } from './role-detail.service';
import { UpdateNameOfRoleDto } from '@app/constracts/users/dto/update-roleDetail.dto';
import { RoleDetail } from '../schema/role-detail.schema';
import { UpdatePermissionsOfRoleDto } from '@app/constracts/users/dto/update-permissions.dto';

@Controller()
export class RoleDetailController {
  constructor(private roleDetailService: RoleDetailService) {}

  @MessagePattern({ cmd: 'role-detail.getAll' })
  async getAllRoles() {
    const roleOrError = await this.roleDetailService.find({ name: { $ne: 'User' } });

    return roleOrError.match(
      (v: RoleDetail[]) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @MessagePattern({ cmd: 'role-detail.getOne' })
  async getRoleById(@Payload() id: string) {
    const roleOrError = await this.roleDetailService.findOne({ _id: id });
    return roleOrError.match(
      (v: RoleDetail) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @MessagePattern({ cmd: 'role-detail.insert' })
  async insertRole(@Payload() dto: { name: string }) {
    const roleOrError = await this.roleDetailService.create({ name: dto.name });
    return roleOrError.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @MessagePattern({ cmd: 'role-detail-name.update' })
  async updateRole(@Payload() payload: { id: string; body: UpdateNameOfRoleDto }) {
    const { id, body } = payload;
    const roleOrError = await this.roleDetailService.update(id, body);
    return roleOrError.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @MessagePattern({ cmd: 'role-detail.setup' })
  async setupRolePermissions(@Payload() body: UpdatePermissionsOfRoleDto[]) {
    await this.roleDetailService.handleRoleSetup(body);
    return ok({ message: 'Role permissions updated successfully' });
  }

  @MessagePattern({ cmd: 'role-detail.delete' })
  async deleteRole(@Payload() id: string) {
    const roleOrError = await this.roleDetailService.remove(id);
    return roleOrError.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }
}
