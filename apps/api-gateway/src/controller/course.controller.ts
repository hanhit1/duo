import { Admin, PaginationReq } from '@app/constracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCourseDto } from '@app/constracts/learning/dto/create-course.dto';
import { UpdateCourseDto } from '@app/constracts/learning/dto/update-course.dto';
import { FastifyReply } from 'fastify';

@ApiTags('Course')
@ApiCookieAuth()
@Controller('courses')
export class CourseController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Get('user')
  @ApiOperation({
    summary: 'User view a paginated list of courses',
    description: 'This API will return a paginated list of courses to Users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  userGetAllCourse(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Res() res: FastifyReply,
  ) {
    const payload: PaginationReq = {
      page,
      pageSize,
    };
    this.client.send({ cmd: 'course.getAllByUser' }, payload).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Admin()
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of courses',
    description: 'This API will return a paginated list of courses to Admin',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  adminGetAllCourse(@Query('page') page, @Query('pageSize') pageSize, @Res() res: FastifyReply) {
    const payload: PaginationReq = {
      page,
      pageSize,
    };
    this.client.send({ cmd: 'course.getAllByAdmin' }, payload).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Admin()
  @Post()
  adminCreateCourse(@Body() body: CreateCourseDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.create' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(201).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Admin()
  @Get(':id')
  adminGetOne(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.getOne' }, id).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Admin()
  @Patch(':id')
  @ApiBody({ type: UpdateCourseDto })
  adminUpdateCourse(@Param('id') id: string, @Body() body, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.update' }, { id, body }).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Admin()
  @Delete(':id')
  adminDeleteCourse(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.remove' }, id).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }
}
