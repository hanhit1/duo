import { CustomRequest, Permissions, UpdateProgressDto } from '@app/constracts';
import { Controller, Get, Inject, Param, Req, Res, Body, Patch, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';
import { forkJoin } from 'rxjs';

@ApiTags('Progress')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('progress')
export class ProgressController {
  constructor(
    @Inject('LEARNING_SERVICE') private readonly client: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @ApiOperation({
    summary: 'User view list of units and lessons with progress by courseId',
    description:
      'This API will return list of units and lessons with progress by courseId to Users',
  })
  @Permissions('user')
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

  @ApiOperation({
    summary: 'User update progress after completing a lesson',
    description: 'This API will update progress after completing a lesson for Users',
  })
  @Permissions('user')
  @Patch()
  userUpdateProgress(
    @Body() body: UpdateProgressDto,
    @Req() req: CustomRequest,
    @Res() res: FastifyReply,
  ) {
    const userId = req.user.userId;
    const { lessonId, unitId, courseId, experiencePoint, heartCount } = body;

    //  Learning Service
    const updateLearning = this.client.send(
      { cmd: 'progress.userUpdate' },
      { userId, lessonId, unitId, courseId },
    );

    //User Service
    const updateUser = this.userClient.send(
      { cmd: 'user.updateExpAndHeart' },
      { userId, experiencePoint, heartCount },
    );

    // Chạy song song
    forkJoin([updateLearning, updateUser]).subscribe({
      next: ([learningResult, userResult]) => {
        if (!learningResult.value) {
          return res.status(400).send({ message: learningResult.error.message });
        }

        if (!userResult.value) {
          return res.status(400).send({ message: userResult.error.message });
        }

        res.status(200).send({
          learning: learningResult.value,
          user: userResult.value,
        });
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @ApiOperation({
    summary: 'User view all courses with progress',
    description: 'This API will return all courses with progress to Users',
  })
  @Permissions('user')
  @Get('courses')
  userGetAllCourses(@Req() req: CustomRequest, @Res() res: FastifyReply) {
    const userId = req.user.userId;

    this.client.send({ cmd: 'courseAndProgress.getAllByUser' }, { userId }).subscribe({
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
    summary: 'Check if user has course progress',
    description: 'This API will check if user has course progress',
  })
  @Permissions('user')
  @Get()
  checkCourseByProgress(@Req() req: CustomRequest, @Res() res: FastifyReply) {
    const userId = req.user.userId;

    this.client.send({ cmd: 'progress.checkByUser' }, { userId }).subscribe({
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
}
