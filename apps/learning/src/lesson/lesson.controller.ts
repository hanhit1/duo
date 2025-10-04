import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';
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
import { CreateLessonDto } from '@app/constracts';
import { UpdateLessonDto } from '@app/constracts';
import { Lesson } from '../schema/lesson.schema';
import { Types } from 'mongoose';

@Controller()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @MessagePattern({ cmd: 'lesson.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: GetCommonDto) {
    const { search, sort, filter, page = 1, pageSize = 20 } = payload;

    const sortValue = sort ?? {
      field: 'displayOrder',
      value: 'ASC',
    };

    const queryCondition = toQueryCondition(filter ?? []);
    const resultOrErr = await this.lessonService.find(
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
    const countOrError = await this.lessonService.count(queryCondition, search);
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
      (items: Lesson[]) => {
        return ok(toApiOkResp(items, pagination));
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
      unitId: new Types.ObjectId(createLessonDto.unitId),
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

  @Delete()
  @MessagePattern({ cmd: 'lesson.remove' })
  async adminDeleteLesson(@Payload() id: string) {
    const resultOrErr = await this.lessonService.remove(id);
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
