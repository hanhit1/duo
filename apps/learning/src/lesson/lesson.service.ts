import { AppError, CRUDService, ErrorMessage, UpdateLessonDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Lesson } from '../schema/lesson.schema';
import { Model, Types } from 'mongoose';
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
        createDto.unitId = new Types.ObjectId(createDto.unitId as any);
        const hasUnit = this.unitService.findOne({ _id: createDto.unitId });
        if (!hasUnit) {
          return err({
            message: 'UnitId not found',
            statusCode: 400,
          });
        }
      }
      if (!createDto.displayOrder) {
        createDto.displayOrder = (await this.lessonModel.countDocuments()) + 1;
      } else {
        const isExistDisplayOrder = await this.lessonModel.findOne({
          displayOrder: Number(createDto.displayOrder),
        });
        if (isExistDisplayOrder) {
          return err({
            message: 'Display order already exists',
            statusCode: 400,
          });
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
      if (updateLessonDto.unitId) {
        updateLessonDto.unitId = new Types.ObjectId(updateLessonDto.unitId as any) as any;
        const hasUnit = this.unitService.findOne({ _id: updateLessonDto.unitId });
        if (!hasUnit) {
          return err({
            message: 'UnitId not found',
            statusCode: 400,
          });
        }
      }

      if (updateLessonDto.displayOrder) {
        const isExist = await this.lessonModel.findOne({
          displayOrder: +updateLessonDto.displayOrder,
          _id: { $ne: convertToObjectId(id) },
        });

        if (isExist) {
          return err({
            message: 'Display order already exists',
            statusCode: 400,
          });
        }
      }

      const lesson = await this.lessonModel.findOneAndUpdate({ _id: id }, updateLessonDto, {
        new: true,
      });

      if (!lesson) {
        return err({
          message: 'This lesson is not exist',
          statusCode: 404,
        });
      }

      return ok(lesson as Lesson);
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
