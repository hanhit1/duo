import { CustomRequest, Permissions } from '@app/constracts';
import { Body, Controller, Get, Inject, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';

import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateMistakeDto } from '@app/constracts/learning/dto/create-mistake.dto';
import { UpdateMistakeDto } from '@app/constracts/learning/dto/update-mistake.dto';
import { forkJoin } from 'rxjs';

@ApiTags('Mistake')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('mistakes')
export class MistakeController {
  constructor(
    @Inject('LEARNING_SERVICE') private readonly client: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @ApiOperation({
    summary: 'Get all mistakes by user',
    description: 'This API will return all mistakes by user to Users',
  })
  @Permissions('user')
  @Get()
  getMistakes(@Req() req: CustomRequest, @Res() res: FastifyReply) {
    const userId = req.user.userId;
    this.client.send({ cmd: 'mistake.getAllByUser' }, userId).subscribe({
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

  @ApiOperation({
    summary: 'Add question to list of mistakes',
    description: 'This API will add question to list of mistakes for Users',
  })
  @Permissions('user')
  @Post()
  createMistake(
    @Body() body: CreateMistakeDto,
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = req.user.userId;
    this.client.send({ cmd: 'mistake.create' }, { ...body, userId }).subscribe({
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

  @ApiOperation({
    summary: 'Update mistakes after answering questions correctly',
    description: 'This API will update mistakes after answering questions correctly for Users',
  })
  @Permissions('user')
  @Patch()
  updateMistake(
    @Body() body: UpdateMistakeDto,
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = req.user.userId;

    //  Learning Service
    const updateMistake = this.client.send({ cmd: 'mistake.update' }, { body, userId });

    //User Service
    const updateUser = this.userClient.send({ cmd: 'user.updateExpAndHeart' }, { userId });

    // Chạy song song
    forkJoin([updateMistake, updateUser]).subscribe({
      next: ([mistakeResult, userResult]) => {
        if (!mistakeResult.value) {
          return res.status(400).send({ message: mistakeResult.error.message });
        }

        if (!userResult.value) {
          return res.status(400).send({ message: userResult.error.message });
        }

        res.status(200).send({
          learning: mistakeResult.value,
          user: userResult.value,
        });
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }
}
