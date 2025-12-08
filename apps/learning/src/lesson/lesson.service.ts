import { AppError, CRUDService, ErrorMessage, UpdateLessonDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Lesson } from '../schema/lesson.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { UnitService } from '../unit/unit.service';

dotenv.config();

@Injectable()
export class LessonService extends CRUDService<Lesson> {
  constructor(
    @InjectModel(Lesson.name) private readonly lessonModel: Model<Lesson>,
    private readonly unitService: UnitService,
  ) {
    super(lessonModel);
  }

  async adminGetAllLessonNotPaginate(): Promise<Result<Lesson[], AppError>> {
    const result = await this.lessonModel
      .find()
      .select('_id title thumbnail')
      .sort({ displayOrder: 1 })
      .lean();
    return ok(result as Lesson[]);
  }

  async create(createDto: Partial<Lesson>): Promise<Result<Lesson, AppError>> {
    try {
      const currentMaxDisplayOrder = await this.lessonModel
        .findOne({ unitId: createDto.unitId })
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean();
      const nextDisplayOrder = currentMaxDisplayOrder ? currentMaxDisplayOrder.displayOrder + 1 : 1;

      const modelInstance = new this.lessonModel({ ...createDto, displayOrder: nextDisplayOrder });
      const createdModel = await modelInstance.save();
      return ok(createdModel.toObject() as Lesson);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Result<Lesson, AppError>> {
    try {
      let hasLesson = await this.lessonModel.findById(id);
      if (!hasLesson) {
        return err({
          message: 'This lesson is not exist',
          statusCode: 404,
        });
      }
      // remove displayOrder and courseId from update dto to prevent updating it
      delete updateLessonDto['displayOrder'];
      delete updateLessonDto['courseId'];

      hasLesson = await this.lessonModel.findOneAndUpdate({ _id: id }, updateLessonDto, {
        new: true,
      });

      return ok(hasLesson as Lesson);
    } catch (e) {
      return err({
        message: 'Error when updating lesson',
        statusCode: 500,
        context: updateLessonDto,
        cause: e,
      });
    }
  }
  async getFirstLessonOfUnit(unitId: string): Promise<Result<Lesson, AppError>> {
    try {
      const lesson = await this.lessonModel
        .findOne({ unitId: unitId })
        .sort({ displayOrder: 1 })
        .lean();
      if (lesson) {
        return ok(lesson as Lesson);
      } else {
        return err({
          message: 'No lessons found for the specified unit.',
          statusCode: 404,
        });
      }
    } catch (e) {
      return err({
        message: 'Error when retrieving the first lesson of the unit',
        statusCode: 500,
        cause: e,
      });
    }
  }

  async findOneNextLesson(
    displayOrder: number,
    unitDisplayOrder: number,
    unitId: string,
    courseId: string,
  ): Promise<Result<Lesson, AppError>> {
    try {
      const lesson = await this.lessonModel
        .findOne({ displayOrder: { $gt: displayOrder }, unitId: unitId })
        .sort({ displayOrder: 1 })
        .exec();

      if (!lesson) {
        const unitOrErr = await this.unitService.findOneNextUnit(unitDisplayOrder, courseId);
        if (unitOrErr.isErr()) {
          return err({ message: unitOrErr.error.message });
        }

        const nextUnit = unitOrErr.value;
        const firstLessonOfNextUnit = await this.lessonModel
          .findOne({ unitId: nextUnit._id.toString() })
          .sort({ displayOrder: 1 })
          .exec();

        if (!firstLessonOfNextUnit) {
          return err({ message: 'No next lesson found.' });
        }
        return ok(firstLessonOfNextUnit as Lesson);
      }

      return ok(lesson as Lesson);
    } catch (error) {
      return err({ message: 'Failed to retrieve next lesson.', cause: error });
    }
  }
}
