import { AdminGetCourseDto, PaginationReq, Permissions } from '@app/constracts';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCourseDto } from '@app/constracts/learning/dto/create-course.dto';
import { UpdateCourseDto } from '@app/constracts/learning/dto/update-course.dto';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';

@ApiTags('Course')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('courses')
export class CourseController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Permissions('user')
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
        if (result.value || result.value == null) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Permissions('course.view')
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of courses',
    description: 'This API will return a paginated list of courses to Admin',
  })
  @ApiQuery({
    name: 'sort',
    description: 'Sorting conditions in the format: "field:order"',
    required: false,
    type: 'string',
    example: 'displayOrder:ASC',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of items per page',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'search',
    description: 'Search query',
    required: false,
    type: 'string',
    example: 'English',
  })
  adminGetAllCourse(@Query() dto: AdminGetCourseDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.getAllByAdmin' }, dto).subscribe({
      next: (result: any) => {
        if (result.value || result.value == null) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Permissions('course.view')
  @Get('admin/all-not-paginate')
  @ApiOperation({
    summary: 'Admin view a list of all courses without pagination to implement Course-combobox',
    description: 'This API will return a list of courses without pagination to Admin',
  })
  adminGetAllCourseNotPaginate(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.getAllNotPaginate' }, {}).subscribe({
      next: (result: any) => {
        if (result.value || result.value == null) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Permissions('course.create')
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

  @Get(':id')
  getOneCourse(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'course.getOne' }, id).subscribe({
      next: (result: any) => {
        if (result.value == null) {
          return res.status(404).send({ message: 'Model not found' });
        }
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Permissions('course.edit')
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
}
