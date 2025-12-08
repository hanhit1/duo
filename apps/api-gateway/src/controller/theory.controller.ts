import { GetCommonDto, PaginationReq, Permissions } from '@app/constracts';
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
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTheoryDto } from '@app/constracts/learning/dto/create-theory.dto';
import { UpdateTheoryDto } from '@app/constracts/learning/dto/update-theory.dto';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';

@ApiTags('Theory')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('theories')
export class TheoryController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Permissions('user')
  @Get('user/:unitId')
  @ApiOperation({
    summary: 'User view a paginated list of theories by unitId',
    description: 'This API will return a paginated list of theories by unitId to Users',
  })
  @ApiParam({ name: 'unitId', required: true, type: String, example: '68ee1a34c266b0cca468706a' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  userGetAllTheory(
    @Param('unitId') unitId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Res() res: FastifyReply,
  ) {
    const payload: PaginationReq = {
      page,
      pageSize,
    };
    this.client.send({ cmd: 'theory.getAllByUser' }, { unitId, ...payload }).subscribe({
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

  @Permissions('theory.view')
  @Get('admin')
  @ApiOperation({
    summary: 'Admin view a paginated list of theories',
    description: 'This API will return a paginated list of theories to Admin',
  })
  @ApiQuery({
    name: 'unitId',
    description: 'Filter theories by unitId',
    required: false,
    type: 'string',
    example: '68e0b54135010339c4438f57',
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
  adminGetAllTheory(@Query() dto: GetCommonDto & { unitId?: string }, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'theory.getAllByAdmin' }, dto).subscribe({
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

  @Permissions('theory.create')
  @Post()
  adminCreateTheory(@Body() body: CreateTheoryDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'theory.create' }, body).subscribe({
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
  getOneTheory(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'theory.getOne' }, id).subscribe({
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

  @Permissions('theory.edit')
  @Patch(':id')
  @ApiBody({ type: UpdateTheoryDto })
  adminUpdateTheory(
    @Param('id') id: string,
    @Body() body: UpdateTheoryDto,
    @Res() res: FastifyReply,
  ) {
    this.client.send({ cmd: 'theory.update' }, { id, body }).subscribe({
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

  @Permissions('theory.delete')
  @Delete(':id')
  adminDeleteTheory(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'theory.remove' }, id).subscribe({
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
