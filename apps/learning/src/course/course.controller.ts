import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { CourseService } from './course.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import { AppError, ErrorMessage, PaginationReq, toApiOkResp } from '@app/constracts';
import { CreateCourseDto } from '@app/constracts';
import { UpdateCourseDto } from '@app/constracts';

@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @MessagePattern({ cmd: 'course.getAllByUser' })
  async getAllByUser(@Payload() payload: PaginationReq) {
    const resultOrErr = await this.courseService.userGetAllCourse(payload);
    return resultOrErr.match(
      ([items, totalRecords]) => {
        const totalPages = Math.ceil(totalRecords / payload.pageSize);
        return ok(
          toApiOkResp(items, {
            page: +payload.page,
            pageSize: +payload.pageSize,
            totalPages,
            totalRecords,
          }),
        );
      },
      (e: AppError) => {
        return err({ message: e.message });
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'course.getOne' })
  async getById(@Payload() id: string) {
    const resultOrErr = await this.courseService.findById(id);
    return resultOrErr.match(
      (v) => {
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
        return err({ message: ErrorMessage.UNAUTHORIZED });
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

  @Delete()
  @MessagePattern({ cmd: 'course.remove' })
  async adminDeleteCourse(@Payload() id: string) {
    const resultOrErr = await this.courseService.remove(id);
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
