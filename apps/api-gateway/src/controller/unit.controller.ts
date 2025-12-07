import { CustomRequest, GetCommonDto, PaginationReq, Permissions } from '@app/constracts';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUnitDto } from '@app/constracts/learning/dto/create-unit.dto';
import { UpdateUnitDto } from '@app/constracts/learning/dto/update-unit.dto';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';

@ApiTags('Unit')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('units')
export class UnitController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Permissions('unit.view')
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of units',
    description: 'This API will return a paginated list of units to Admin',
  })
  @ApiQuery({
    name: 'courseId',
    description: 'Filter units by courseId',
    required: false,
    type: 'string',
    example: '68cd5bd514e80cdf75770d9e',
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
  adminGetAllUnit(@Query() dto: GetCommonDto & { courseId?: string }, @Res() res: FastifyReply) {
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

  @Get('admin/all-not-paginate')
  @ApiOperation({
    summary: 'Admin view a list of all units without pagination to implement Unit-combobox',
    description: 'This API will return a list of units without pagination to Admin',
  })
  getAllUnitNotPaginate(@Res() res: FastifyReply) {
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

  @Permissions('user')
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
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const payload: PaginationReq = {
      page,
      pageSize,
    };
    const userId = req.user.userId;

    this.client
      .send({ cmd: 'unitAndLesson.getAllByUser' }, { courseId, userId, ...payload })
      .subscribe({
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

  @Permissions('unit.create')
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

  @Get(':id')
  getOneUnit(@Param('id') id: string, @Res() res: FastifyReply) {
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

  @Permissions('unit.edit')
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

  // @Get('course/:id')
  // adminGetByCourseId(
  //   @Param('id') id: string,
  //   @Res() res: FastifyReply,
  //   @Query() dto: GetCommonDto,
  // ) {
  //   this.client.send({ cmd: 'unit.getByCourseId' }, { courseId: id, ...dto }).subscribe({
  //     next: (result: any) => {
  //       if (result.value) {
  //         res.status(200).send(result);
  //       } else {
  //         res.status(400).send({ message: result.error.message });
  //       }
  //     },
  //     error: () => res.status(500).send({ message: 'Internal server error' }),
  //   });
  // }
}
