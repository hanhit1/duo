import { Controller, Get, Patch, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import {
  AppError,
  FilterItem,
  GetCommonDto,
  Pagination,
  toApiErrorResp,
  toApiOkResp,
  toQueryCondition,
} from '@app/constracts';
import { CreateLessonDto } from '@app/constracts';
import { UpdateLessonDto } from '@app/constracts';
import { Lesson } from '../schema/lesson.schema';

@Controller()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @MessagePattern({ cmd: 'lesson.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: GetCommonDto & { unitId?: string }) {
    const { search, sort, page = 1, pageSize = 20, unitId } = payload;
    const filter: FilterItem[] = [];
    let sortObj;
    if (unitId) {
      filter?.push({ field: 'unitId', operator: 'eq', value: unitId });
    }
    if (sort) {
      const [field, value] = (sort as any).split(':');
      sortObj = { field, value: (value ?? 'ASC').toUpperCase() };
    }
    const queryCondition = toQueryCondition(filter);
    const resultOrErr = await this.lessonService.find(
      queryCondition,
      [], // populate
      {
        page,
        pageSize,
      },
      sortObj,
      {}, // projection
      search,
    );
    const countOrError = await this.lessonService.count(queryCondition, search);
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
      (items: Lesson[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'lesson.getAllNotPaginate' })
  async getAllLessonNotPaginate() {
    const resultOrErr = await this.lessonService.adminGetAllLessonNotPaginate();
    return resultOrErr.match(
      (items: Lesson[]) => {
        return ok(items);
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'lesson.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.lessonService.findOne({ _id: id });
    return resultOrErr.match(
      (v: Lesson) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'lesson.create' })
  async adminCreateLesson(@Payload() createLessonDto: CreateLessonDto) {
    const resultOrErr = await this.lessonService.create({
      ...createLessonDto,
      unitId: createLessonDto.unitId,
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
  @MessagePattern({ cmd: 'lesson.update' })
  async adminUpdateLesson(@Payload() payload: { id: string; body: UpdateLessonDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.lessonService.update(id, body);
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
