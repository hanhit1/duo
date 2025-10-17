import { Admin, AdminGetQuestionsDto } from '@app/constracts';
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
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from '@app/constracts/learning/dto/create-question.dto';
import { UpdateQuestionDto } from '@app/constracts/learning/dto/update-question.dto';
import { FastifyReply } from 'fastify';

@ApiTags('Question')
@ApiCookieAuth()
@Controller('questions')
export class QuestionController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Get('user/:lessonId')
  @ApiOperation({
    summary: 'User view a list of questions',
    description: 'This API will return a list of questions to Users',
  })
  @ApiParam({ name: 'lessonId', required: true, type: String, example: '68e0ff54c70a8e676d5867ce' })
  userGetAllQuestions(@Param('lessonId') lessonId: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'question.getAllByUser' }, { lessonId }).subscribe({
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
    summary: 'Admin view a paginated list of questions',
    description: 'This API will return a paginated list of questions to Admin',
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
  adminGetAllQuestions(@Query() dto: AdminGetQuestionsDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'question.getAllByAdmin' }, dto).subscribe({
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
  adminCreateQuestion(@Body() body: CreateQuestionDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'question.create' }, body).subscribe({
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
    this.client.send({ cmd: 'question.getOne' }, id).subscribe({
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
  @ApiBody({ type: UpdateQuestionDto })
  adminUpdateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
    @Res() res: FastifyReply,
  ) {
    this.client.send({ cmd: 'question.update' }, { id, body }).subscribe({
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
  adminDeleteQuestion(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'question.remove' }, id).subscribe({
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
