import { Controller, Get, Patch } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppError, toApiErrorResp, toApiOkResp } from '@app/constracts';
import { LessonService } from '../lesson/lesson.service';
import { UnitService } from '../unit/unit.service';
import { Lesson } from '../schema/lesson.schema';
import { Progress } from '../schema/progress.schema';
import { err, ok } from 'neverthrow';
import { Unit } from '../schema/unit.schema';
import { CourseService } from '../course/course.service';
import { Course } from '../schema/course.schema';

@Controller()
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly unitService: UnitService,
    private readonly lessonService: LessonService,
    private readonly courseService: CourseService,
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
                    progress &&
                    lesson.displayOrder > lessonCurrent.value.displayOrder &&
                    unit._id.toString() === unitCurrent.value._id.toString()
                      ? true
                      : progress && unit.displayOrder > unitCurrent.value.displayOrder
                        ? true
                        : false;
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

  @Patch()
  @MessagePattern({ cmd: 'progress.userUpdate' })
  async userUpdate(
    @Payload() payload: { userId: string; lessonId: string; unitId: string; courseId: string },
  ) {
    const { userId, lessonId, unitId, courseId } = payload;

    const progressOrErr = await this.progressService.findOne({ user: userId });

    if (progressOrErr.isErr()) {
      return err({ message: progressOrErr.error.message });
    }

    const progress = progressOrErr.value;

    if (!progress) {
      return err({ message: 'Progress record not found for the user.' });
    } else {
      const currentLessonOrErr = await this.lessonService.findOne({ _id: lessonId });

      if (currentLessonOrErr.isErr()) {
        return err({ message: currentLessonOrErr.error.message });
      }

      const currentLesson = currentLessonOrErr.value;

      if (!currentLesson) {
        return err({ message: 'Current lesson not found.' });
      }

      const progressLessonOrErr = await this.lessonService.findOne({
        _id: progress.lesson.toString(),
      });

      if (progressLessonOrErr.isErr()) {
        return err({ message: progressLessonOrErr.error.message });
      }

      const progressLesson = progressLessonOrErr.value;

      if (!progressLesson) {
        return err({ message: 'Progress lesson not found.' });
      }

      const progressUnitOrErr = await this.unitService.findOne({
        _id: progress.unit.toString(),
      });

      if (progressUnitOrErr.isErr()) {
        return err({ message: progressUnitOrErr.error.message });
      }

      const progressUnit = progressUnitOrErr.value;

      if (!progressUnit) {
        return err({ message: 'Progress unit not found.' });
      }

      const currentUnitOrErr = await this.unitService.findOne({ _id: unitId });

      if (currentUnitOrErr.isErr()) {
        return err({ message: currentUnitOrErr.error.message });
      }

      const currentUnit = currentUnitOrErr.value;

      if (!currentUnit) {
        return err({ message: 'Current unit not found.' });
      }

      const progressCourseOrErr = await this.courseService.findOne({
        _id: progress.course.toString(),
      });

      if (progressCourseOrErr.isErr()) {
        return err({ message: progressCourseOrErr.error.message });
      }

      const progressCourse = progressCourseOrErr.value;

      if (!progressCourse) {
        return err({ message: 'Progress course not found.' });
      }

      const currentCourseOrErr = await this.courseService.findOne({ _id: courseId });

      if (currentCourseOrErr.isErr()) {
        return err({ message: currentCourseOrErr.error.message });
      }

      const currentCourse = currentCourseOrErr.value;

      if (!currentCourse) {
        return err({ message: 'Current course not found.' });
      }

      const isGoingBackward =
        currentCourse.displayOrder < progressCourse.displayOrder ||
        (currentCourse.displayOrder === progressCourse.displayOrder &&
          currentUnit.displayOrder < progressUnit.displayOrder) ||
        (currentCourse.displayOrder === progressCourse.displayOrder &&
          currentUnit.displayOrder === progressUnit.displayOrder &&
          currentLesson.displayOrder < progressLesson.displayOrder);

      if (isGoingBackward) {
        return ok(toApiOkResp({ result: progress }));
      }

      const newLessonOrErr = await this.lessonService.findOneNextLesson(
        progressLesson.displayOrder,
        progressUnit.displayOrder,
        unitId,
        courseId,
      );

      if (newLessonOrErr.isErr()) {
        return err({ message: newLessonOrErr.error.message });
      }

      const newLesson = newLessonOrErr.value;

      const unitOfNewLesson = await this.unitService.findOne({ _id: newLesson.unitId.toString() });

      if (unitOfNewLesson.isErr()) {
        return err({ message: unitOfNewLesson.error.message });
      }

      if (!unitOfNewLesson.value) {
        return err({ message: 'Unit of new lesson not found.' });
      }

      const updatedProgressOrErr = await this.progressService.update(progress._id.toString(), {
        lesson: newLesson._id.toString(),
        unit: unitOfNewLesson.value._id.toString(),
        course: unitOfNewLesson.value.courseId.toString(),
      });

      if (updatedProgressOrErr.isErr()) {
        return err({ message: updatedProgressOrErr.error.message });
      }

      return ok(toApiOkResp({ result: updatedProgressOrErr.value }));
    }
  }

  @Get()
  @MessagePattern({ cmd: 'courseAndProgress.getAllByUser' })
  async getCourseByUser(@Payload() payload: { userId: string }) {
    const { userId } = payload;
    const sortValue = { field: 'displayOrder', value: 'ASC' };

    const resultOrErr = await this.courseService.find(undefined, undefined, undefined, sortValue);

    if (resultOrErr.isErr()) {
      return err({ message: resultOrErr.error.message });
    }

    if (resultOrErr.value.length == 0) {
      return err({ message: 'No courses found for the specified course.' });
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
      const firstUnit = await this.unitService.getFirstUnitOfCourse(
        resultOrErr.value[0]._id.toString(),
      );
      if (firstUnit.isErr()) {
        return err({ message: firstUnit.error.message });
      }

      const firstLesson = await this.lessonService.getFirstLessonOfUnit(
        firstUnit.value._id.toString(),
      );

      if (firstLesson.isErr()) {
        return err({ message: firstLesson.error.message });
      }

      const createdProgress = await this.progressService.create({
        user: userId,
        course: resultOrErr.value[0]._id.toString(),
        lesson: firstLesson.value._id.toString(),
        unit: firstUnit.value._id.toString(),
      });
      if (createdProgress.isErr()) {
        return err({ message: createdProgress.error.message });
      }
      progress = createdProgress.value;
    }

    const courseCurrent = await this.courseService.findOne({ _id: progress.course.toString() });
    if (courseCurrent.isErr()) {
      return err({ message: courseCurrent.error.message });
    }

    if (!courseCurrent.value) {
      return err({ message: 'Current unit not found.' });
    }

    return resultOrErr.match(
      (items: Course[]) => {
        const result = items.map((course) => {
          return {
            ...course,
            isLocked: progress && course.displayOrder > courseCurrent.value.displayOrder,
          };
        });
        return ok(toApiOkResp({ result, progress }));
      },
      (e: AppError) => {
        return err(toApiErrorResp(e));
      },
    );
  }

  @Get()
  @MessagePattern({ cmd: 'progress.checkByUser' })
  async checkProgressByUser(@Payload() payload: { userId: string }) {
    const resultOrErr = await this.progressService.findOne({ user: payload.userId });
    return resultOrErr.match(
      (v: Progress) => {
        return ok(v);
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }
}
