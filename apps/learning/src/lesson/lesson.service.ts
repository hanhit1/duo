import { AppError, CRUDService, ErrorMessage, UpdateLessonDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Lesson } from '../schema/lesson.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { convertToObjectId } from '@app/constracts/helpers/convertToObjectId';
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

  async create(createDto: Partial<Lesson>): Promise<Result<Lesson, AppError>> {
    try {
      if (createDto.unitId) {
        //check unit
        createDto.unitId = convertToObjectId(createDto.unitId);
        const hasCourse = this.unitService.findOne({ _id: createDto.unitId });
        if (!hasCourse) {
          return err({
            message: 'UnitId not found',
            statusCode: 400,
          });
        }
        // calculate displayOrder of lesson
        if (!createDto.displayOrder) {
          // get lesson has max displayOrder in the same unit
          const lastLesson = await this.lessonModel
            .findOne({ unitId: createDto.unitId })
            .sort({ displayOrder: -1 })
            .select({ displayOrder: 1 })
            .lean();

          createDto.displayOrder = lastLesson ? lastLesson.displayOrder + 1 : 1;
        } else {
          const isExistDisplayOrder = await this.lessonModel.findOne({
            unitId: createDto.unitId,
            displayOrder: Number(createDto.displayOrder),
          });
          if (isExistDisplayOrder) {
            return err({
              message: 'Display order already exists',
              statusCode: 400,
            });
          }
        }
      }

      const modelInstance = new this.lessonModel(createDto);
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
      } else {
        const targetUnitId = convertToObjectId(
          updateLessonDto.unitId ? updateLessonDto.unitId : hasLesson.unitId,
        );
        const targetDisplayOrder = Number(
          updateLessonDto.displayOrder ? updateLessonDto.displayOrder : hasLesson.displayOrder,
        );
        const hasUnit = await this.unitService.findOne({ _id: targetUnitId });
        if (!hasUnit) {
          return err({ message: 'UnitId not found', statusCode: 400 });
        }
        const isExistingDisplayOrder = await this.lessonModel.findOne({
          unitId: targetUnitId,
          displayOrder: targetDisplayOrder,
          _id: { $ne: convertToObjectId(id) },
        });
        if (isExistingDisplayOrder) {
          return err({
            message: 'Display order already exists',
            statusCode: 400,
          });
        }
      }

      hasLesson = await this.lessonModel.findOneAndUpdate(
        { _id: id },
        {
          ...updateLessonDto,
          unitId: convertToObjectId(
            updateLessonDto.unitId ? updateLessonDto.unitId : hasLesson.unitId,
          ),
        },
        {
          new: true,
        },
      );

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
}
