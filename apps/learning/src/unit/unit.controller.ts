import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UnitService } from './unit.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import {
  AppError,
  GetCommonDto,
  Pagination,
  toApiErrorResp,
  toApiOkResp,
  toQueryCondition,
} from '@app/constracts';
import { CreateUnitDto } from '@app/constracts';
import { UpdateUnitDto } from '@app/constracts';
import { Unit } from '../schema/unit.schema';
import { Lesson } from '../schema/lesson.schema';

@Controller()
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @MessagePattern({ cmd: 'unit.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: GetCommonDto) {
    const { search, sort, filter, page = 1, pageSize = 20 } = payload;

    const sortValue = sort ?? {
      field: 'displayOrder',
      value: 'ASC',
    };

    const queryCondition = toQueryCondition(filter ?? []);
    const resultOrErr = await this.unitService.find(
      queryCondition,
      [{ path: 'lessons', model: Lesson.name, options: { sort: { displayOrder: 1 } } }],
      {
        page,
        pageSize,
      },
      sortValue,
      {}, // projection
      search,
    );
    const countOrError = await this.unitService.count(queryCondition, search);
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
      (items: Unit[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'unit.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.unitService.findOne({ _id: id }, [
      { path: 'lessons', model: Lesson.name, options: { sort: { displayOrder: 1 } } },
    ]);
    return resultOrErr.match(
      (v: Unit) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'unit.create' })
  async adminCreateUnit(@Payload() createUnitDto: CreateUnitDto) {
    const resultOrErr = await this.unitService.create({
      ...createUnitDto,
      courseId: createUnitDto.courseId,
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

  @Patch()
  @MessagePattern({ cmd: 'unit.update' })
  async adminUpdateUnit(@Payload() payload: { id: string; body: UpdateUnitDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.unitService.update(id, body);
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
  @MessagePattern({ cmd: 'unit.remove' })
  async adminDeleteUnit(@Payload() id: string) {
    const resultOrErr = await this.unitService.remove(id);
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
