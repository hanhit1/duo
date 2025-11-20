import { CustomRequest, UpdateProgressDto } from '@app/constracts';
import { Controller, Get, Inject, Param, Req, Res, Put, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

@ApiTags('Progress')
@ApiCookieAuth()
@Controller('progress')
export class ProgressController {
  constructor(@Inject('LEARNING_SERVICE') private readonly client: ClientProxy) {}

  @Get('units/:courseId')
  userGetAllUnitsLessons(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = req.user.userId;

    this.client
      .send({ cmd: 'unitAndLessonAndProgress.getAllByUser' }, { courseId, userId })
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

  @Put()
  userUpdateProgress(
    @Body() body: UpdateProgressDto,
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = req.user.userId;
    const { lessonId, unitId } = body;

    this.client.send({ cmd: 'progress.userUpdate' }, { userId, lessonId, unitId }).subscribe({
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
