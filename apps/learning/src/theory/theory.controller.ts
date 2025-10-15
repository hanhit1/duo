import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { TheoryService } from './theory.service';
import {
  AppError,
  CreateTheoryDto,
  GetCommonDto,
  Pagination,
  PaginationReq,
  toApiErrorResp,
  toApiOkResp,
  toQueryCondition,
  UpdateTheoryDto,
} from '@app/constracts';
import { err, ok } from 'neverthrow';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Theory } from '../schema/theory.schema';

@Controller()
export class TheoryController {
  constructor(private readonly theoryService: TheoryService) {}

  @Get()
  @MessagePattern({ cmd: 'theory.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: GetCommonDto) {
    const { search, sort, filter, page = 1, pageSize = 20 } = payload;

    const sortValue = sort ?? {
      field: 'displayOrder',
      value: 'ASC',
    };

    const queryCondition = toQueryCondition(filter ?? []);
    const resultOrErr = await this.theoryService.find(
      queryCondition,
      [], // populate
      {
        page,
        pageSize,
      },
      sortValue,
      {}, // projection
      search,
    );
    const countOrError = await this.theoryService.count(queryCondition, search);
    if (countOrError.isErr()) {
      return err({ message: countOrError.error.message });
    }
    const totalRecords = countOrError.value;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const pagination: Pagination = {
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
      totalRecords: totalRecords,
    };
    return resultOrErr.match(
      (items: Theory[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'theory.getAllByUser' })
  async getAllByUser(@Payload() payload: { unitId: string } & PaginationReq) {
    const { page, pageSize, unitId } = payload;
    const sortValue = { field: 'displayOrder', value: 'ASC' };

    const resultOrErr = await this.theoryService.find(
      { unitId }, // filter
      [], // populate
      {
        page,
        pageSize,
      },
      sortValue,
    );
    const countOrError = await this.theoryService.count({ unitId });
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
    return resultOrErr.match(
      (items: Theory[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'theory.create' })
  async adminCreateTheory(@Payload() createTheoryDto: CreateTheoryDto) {
    const resultOrErr = await this.theoryService.create({
      ...createTheoryDto,
      unitId: createTheoryDto.unitId,
    });
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

  @Get()
  @MessagePattern({ cmd: 'theory.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.theoryService.findOne({ _id: id });
    return resultOrErr.match(
      (v: Theory) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Patch()
  @MessagePattern({ cmd: 'theory.update' })
  async adminUpdateTheory(@Payload() payload: { id: string; body: UpdateTheoryDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.theoryService.update(id, body);
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
  @MessagePattern({ cmd: 'theory.remove' })
  async adminDeleteTheory(@Payload() id: string) {
    const resultOrErr = await this.theoryService.remove(id);
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
