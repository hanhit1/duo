import { GetCommonDto, Permissions } from '@app/constracts';
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
import { CreateLessonDto } from '@app/constracts/learning/dto/create-lesson.dto';
import { UpdateLessonDto } from '@app/constracts/learning/dto/update-lesson.dto';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';

@ApiTags('Lesson')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('lessons')
export class LessonController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Permissions('lesson.view')
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of lessons',
    description: 'This API will return a paginated list of lessons to Admin',
  })
  @ApiQuery({
    name: 'unitId',
    description: 'Filter lessons by unitId',
    required: false,
    type: 'string',
    example: '68e0b2497fb03278f10e8aaa',
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
  adminGetAllLesson(@Query() dto: GetCommonDto & { unitId?: string }, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'lesson.getAllByAdmin' }, dto).subscribe({
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

  @Permissions('lesson.view')
  @Get('admin/all-not-paginate')
  @ApiOperation({
    summary: 'Admin view a list of all lessons without pagination to implement Lesson-combobox',
    description: 'This API will return a list of lessons without pagination to Admin',
  })
  adminGetAllLessonNotPaginate(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'lesson.getAllNotPaginate' }, {}).subscribe({
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

  @Permissions('lesson.create')
  @Post()
  adminCreateLesson(@Body() body: CreateLessonDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'lesson.create' }, body).subscribe({
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
  adminGetOne(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'lesson.getOne' }, id).subscribe({
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

  @Permissions('lesson.edit')
  @Patch(':id')
  @ApiBody({ type: UpdateLessonDto })
  adminUpdateLesson(
    @Param('id') id: string,
    @Body() body: UpdateLessonDto,
    @Res() res: FastifyReply,
  ) {
    this.client.send({ cmd: 'lesson.update' }, { id, body }).subscribe({
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

  @Get('unit/:id')
  adminGetByUnitId(@Param('id') id: string, @Res() res: FastifyReply, @Query() dto: GetCommonDto) {
    this.client.send({ cmd: 'lesson.getLessonsByUnitId' }, { unitId: id, ...dto }).subscribe({
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
