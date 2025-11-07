import { Admin, GetCommonDto, PaginationReq } from '@app/constracts';
import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUnitDto } from '@app/constracts/learning/dto/create-unit.dto';
import { UpdateUnitDto } from '@app/constracts/learning/dto/update-unit.dto';
import { FastifyReply } from 'fastify';

@ApiTags('Unit')
@ApiCookieAuth()
@Controller('units')
export class UnitController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Admin()
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of units',
    description: 'This API will return a paginated list of units to Admin',
  })
  @ApiQuery({
    name: 'filter',
    description:
      'Filter conditions in the format: ["field:operator:value"] - (JSON of array string - need to convert to URL before call API in code)',
    required: false,
    type: 'string',
    example: '["description:cn:first"]',
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
  adminGetAllUnit(@Query() dto: GetCommonDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'unit.getAllByAdmin' }, dto).subscribe({
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
  @Get('admin/all-not-paginate')
  @ApiOperation({
    summary: 'Admin view a list of all units without pagination to implement Unit-combobox',
    description: 'This API will return a list of units without pagination to Admin',
  })
  adminGetAllUnitNotPaginate(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'unit.getAllNotPaginate' }, {}).subscribe({
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

  @Get('user/:courseId')
  @ApiOperation({
    summary: 'User view a paginated list of units-lessons by courseId',
    description: 'This API will return a paginated list of units-lessons by courseId to Users',
  })
  @ApiParam({ name: 'courseId', required: true, type: String, example: '68cd5bd514e80cdf75770d9e' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  userGetAllUnitsLessons(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Res() res: FastifyReply,
  ) {
    const payload: PaginationReq = {
      page,
      pageSize,
    };
    this.client.send({ cmd: 'unitAndLesson.getAllByUser' }, { courseId, ...payload }).subscribe({
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
  adminCreateUnit(@Body() body: CreateUnitDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'unit.create' }, body).subscribe({
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
    this.client.send({ cmd: 'unit.getOne' }, id).subscribe({
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
  @ApiBody({ type: UpdateUnitDto })
  adminUpdateUnit(@Param('id') id: string, @Body() body: UpdateUnitDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'unit.update' }, { id, body }).subscribe({
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
  @Get('course/:id')
  adminGetByCourseId(
    @Param('id') id: string,
    @Res() res: FastifyReply,
    @Query() dto: GetCommonDto,
  ) {
    this.client.send({ cmd: 'unit.getByCourseId' }, { courseId: id, ...dto }).subscribe({
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
