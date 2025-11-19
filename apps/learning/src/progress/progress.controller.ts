import { Controller, Get } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppError, toApiErrorResp, toApiOkResp } from '@app/constracts';
import { LessonService } from '../lesson/lesson.service';
import { UnitService } from '../unit/unit.service';
import { Lesson } from '../schema/lesson.schema';
import { Progress } from '../schema/progress.schema';
import { err, ok } from 'neverthrow';
import { Unit } from '../schema/unit.schema';

@Controller()
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly unitService: UnitService,
    private readonly lessonService: LessonService,
  ) {}

  @Get()
  @MessagePattern({ cmd: 'unitAndLessonAndProgress.getAllByUser' })
  async getAllByUser(@Payload() payload: { courseId: string; userId: string }) {
    const { courseId, userId } = payload;
    const sortValue = { field: 'displayOrder', value: 'ASC' };

    const resultOrErr = await this.unitService.find(
      { courseId }, // filter
      [{ path: 'lessons', model: Lesson.name, options: { sort: { displayOrder: 1 } } }],
      undefined,
      sortValue,
    );

    if (resultOrErr.isErr()) {
      return err({ message: resultOrErr.error.message });
    }

    if (resultOrErr.value.length == 0) {
      return err({ message: 'No units found for the specified course.' });
    }

    let progress: Progress;

    const progressRecordsOrErr = await this.progressService.findOne({
      user: userId,
    });

    if (progressRecordsOrErr.isErr()) {
      return err({ message: progressRecordsOrErr.error.message });
    }
    const progressRecords = progressRecordsOrErr.value;

    progress = progressRecords;

    if (!progressRecords) {
      const firstLesson = await this.lessonService.getFirstLessonOfUnit(
        resultOrErr.value[0]._id.toString(),
      );

      if (firstLesson.isErr()) {
        return err({ message: firstLesson.error.message });
      }

      const createdProgress = await this.progressService.create({
        user: userId,
        course: courseId,
        lesson: firstLesson.value._id.toString(),
        unit: resultOrErr.value[0]._id.toString(),
      });
      if (createdProgress.isErr()) {
        return err({ message: createdProgress.error.message });
      }
      progress = createdProgress.value;
    }

    const unitCurrent = await this.unitService.findOne({ _id: progress.unit.toString() });
    if (unitCurrent.isErr()) {
      return err({ message: unitCurrent.error.message });
    }

    if (!unitCurrent.value) {
      return err({ message: 'Current unit not found.' });
    }

    const lessonCurrent = await this.lessonService.findOne({ _id: progress.lesson.toString() });
    if (lessonCurrent.isErr()) {
      return err({ message: lessonCurrent.error.message });
    }

    if (!lessonCurrent.value) {
      return err({ message: 'Current lesson not found.' });
    }

    return resultOrErr.match(
      (items: Unit[]) => {
        const result = items.map((unit) => {
          const lessonsWithProgress =
            !unit.lessons || unit.lessons.length === 0
              ? []
              : (unit.lessons ?? []).map((lesson) => {
                  const isLocked =
                    progress && lesson.displayOrder > lessonCurrent.value.displayOrder;
                  return {
                    ...lesson,
                    isLocked,
                  };
                });
          return {
            ...unit,
            lessons: lessonsWithProgress,
            isLocked: progress && unit.displayOrder > unitCurrent.value.displayOrder,
          };
        });
        return ok(toApiOkResp({ result, progress }));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }
}
