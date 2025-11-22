import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { User } from './schema/user.schema';
import { err, ok } from 'neverthrow';
import {
  AppError,
  CreateUserDto,
  Pagination,
  PaginationReq,
  toApiErrorResp,
  toApiOkResp,
} from '@app/constracts';
import { RoleDetailService } from './role-detail/role-detail.service';
import { convertToObjectId } from '@app/constracts/helpers/convertToObjectId';
import { UpdateAccountDto } from '@app/constracts/users/dto/update-account.dto';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly roleDetailService: RoleDetailService,
  ) {}

  @Get()
  @MessagePattern({ cmd: 'account.getAll' })
  async getAllAccountsAdminWebsite(@Payload() payload: PaginationReq) {
    const { page = 1, pageSize = 10 } = payload;
    const userRole = await this.roleDetailService.findOne({ name: 'User' });
    let filter = {};
    if (userRole.isOk() && userRole.value) {
      filter = { roleId: { $ne: convertToObjectId(userRole.value._id as any) } };
    }
    const accountsOrError = await this.usersService.find(
      filter, // filter
      [
        {
          path: 'roleId',
          select: '_id name',
        },
      ], // populate
      { page, pageSize }, // pagination
      undefined, // sort
      { password: 0 }, // projection
    );

    const countOrError = await this.usersService.count(filter);
    if (countOrError.isErr()) {
      return err({ message: countOrError.error.message });
    }
    const totalRecords = countOrError.value;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const pagination: Pagination = {
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: totalPages,
      totalRecords: totalRecords,
    };
    return accountsOrError.match(
      (items: User[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'account.getOne' })
  async getOneAccount(@Payload() id: string) {
    const accountOrError = await this.usersService.findOne({ _id: id }, [], { password: 0 });
    return accountOrError.match(
      (v: User) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'account.insert' })
  async createAccountAdminWebsite(@Payload() createUserDto: CreateUserDto) {
    const resultOrErr = await this.usersService.createAccountAdminWebsite(createUserDto);
    return resultOrErr.match(
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

  @Patch()
  @MessagePattern({ cmd: 'account.edit' })
  async updateAccountAdminWebsite(@Payload() payload: { id: string; body: UpdateAccountDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.usersService.updateAccountAdminWebsite(id, body);
    return resultOrErr.match(
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

  @Delete()
  @MessagePattern({ cmd: 'account.remove' })
  async deleteAccountAdminWebsite(@Payload() id: string) {
    const resultOrErr = await this.usersService.deleteAccountAdminWebsite(id);
    return resultOrErr.match(
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

  @Patch()
  @MessagePattern({ cmd: 'user.updateExpAndHeart' })
  async updateExpAndHeart(
    @Payload() payload: { userId: string; experiencePoint: number; heartCount: number },
  ) {
    const resultOrErr = await this.usersService.updateExpAndHeart(payload);
    return resultOrErr.match(
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
