import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { QuestionService } from './question.service';
import {
  AppError,
  CreateQuestionDto,
  UpdateQuestionDto,
  GetCommonDto,
  Pagination,
  toApiErrorResp,
  toApiOkResp,
  toQueryCondition,
  FilterItem,
} from '@app/constracts';
import { err, ok } from 'neverthrow';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Question } from '../schema/question.schema';

@Controller()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @MessagePattern({ cmd: 'question.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: GetCommonDto & { lessonId?: string }) {
    const { sort, page = 1, pageSize = 20, lessonId } = payload;
    let filter: FilterItem[] = [];

    if (lessonId) {
      filter = [{ field: 'lessonId', operator: 'eq', value: lessonId }];
    }
    let sortValue;
    if (sort) {
      const [field, value] = (sort as any).split(':');
      sortValue = { field, value: (value ?? 'ASC').toUpperCase() };
    }

    const queryCondition = toQueryCondition(filter);
    const resultOrErr = await this.questionService.find(
      queryCondition,
      [], // populate
      {
        page,
        pageSize,
      },
      sortValue,
      {}, // projection
    );
    const countOrError = await this.questionService.count(queryCondition);
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
      (items: Question[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'question.getAllByUser' })
  async getAllByUser(@Payload() payload: { lessonId: string }) {
    const { lessonId } = payload;
    const sortValue = { field: 'displayOrder', value: 'ASC' };

    const resultOrErr = await this.questionService.find(
      { lessonId }, // filter
      [], // populate
      undefined, // pagination
      sortValue,
    );
    return resultOrErr.match(
      (items: Question[]) => {
        return ok(toApiOkResp(items));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'question.create' })
  async adminCreateQuestion(@Payload() createQuestionDto: CreateQuestionDto) {
    const resultOrErr = await this.questionService.insert({
      ...createQuestionDto,
      lessonId: createQuestionDto.lessonId,
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
  @MessagePattern({ cmd: 'question.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.questionService.findOne({ _id: id });
    return resultOrErr.match(
      (v: Question) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Put()
  @MessagePattern({ cmd: 'question.update' })
  async adminUpdateQuestion(@Payload() payload: { id: string; body: UpdateQuestionDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.questionService.update(id, body);
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
  @MessagePattern({ cmd: 'question.remove' })
  async adminDeleteQuestion(@Payload() id: string) {
    const resultOrErr = await this.questionService.remove(id);
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
