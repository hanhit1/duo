import { Controller, Get, Patch, Post } from '@nestjs/common';
import { CourseService } from './course.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import {
  AdminGetCourseDto,
  AppError,
  Pagination,
  PaginationReq,
  toApiErrorResp,
  toApiOkResp,
} from '@app/constracts';
import { CreateCourseDto } from '@app/constracts';
import { UpdateCourseDto } from '@app/constracts';
import { Course } from '../schema/course.schema';
import { Unit } from '../schema/unit.schema';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @MessagePattern({ cmd: 'course.getAllByAdmin' })
  async getAllByAdmin(@Payload() payload: AdminGetCourseDto) {
    const { search, sort, page = 1, pageSize = 20 } = payload;

    const sortValue = sort ?? {
      field: 'displayOrder',
      value: 'ASC',
    };

    const queryCondition = {};
    const resultOrErr = await this.courseService.find(
      queryCondition, // filter
      [], // populate
      {
        page,
        pageSize,
      },
      sortValue,
      {}, // projection
      search,
    );
    const countOrError = await this.courseService.count(queryCondition, search);
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
      (items: Course[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'course.getAllByUser' })
  async getAllByUser(@Payload() payload: PaginationReq) {
    const { page, pageSize } = payload;
    const sortValue = { field: 'displayOrder', value: 'ASC' };

    const filter = {};
    const resultOrErr = await this.courseService.find(
      filter,
      [{ path: 'units', model: Unit.name, options: { sort: { displayOrder: 1 } } }], // populate
      {
        page,
        pageSize,
      },
      sortValue,
    );
    const countOrError = await this.courseService.count(filter);
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
      (items: Course[]) => {
        return ok(toApiOkResp(items, pagination));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'course.getAllNotPaginate' })
  async getAllCourseNotPaginate() {
    const resultOrErr = await this.courseService.adminGetAllCourseNotPaginate();
    return resultOrErr.match(
      (items: Course[]) => {
        return ok(items);
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'course.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.courseService.findOne({ _id: id });
    return resultOrErr.match(
      (v: Course) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'course.create' })
  async adminCreateCourse(@Payload() createCourseDto: CreateCourseDto) {
    const resultOrErr = await this.courseService.create(createCourseDto);
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
  @MessagePattern({ cmd: 'course.update' })
  async adminUpdateCourse(@Payload() payload: { id: string; body: UpdateCourseDto }) {
    const { id, body } = payload;
    const resultOrErr = await this.courseService.update(id, body);
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
