import { AppError, CRUDService, ErrorMessage, UpdateUnitDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Unit } from '../schema/unit.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { convertToObjectId } from '@app/constracts/helpers/convertToObjectId';
import { CourseService } from '../course/course.service';

dotenv.config();

@Injectable()
export class UnitService extends CRUDService<Unit> {
  constructor(
    @InjectModel(Unit.name) private readonly unitModel: Model<Unit>,
    private readonly courseService: CourseService,
  ) {
    super(unitModel);
  }

  async create(createDto: Partial<Unit>): Promise<Result<Unit, AppError>> {
    try {
      if (createDto.courseId) {
        //check course
        createDto.courseId = convertToObjectId(createDto.courseId);
        const hasCourse = this.courseService.findOne({ _id: createDto.courseId });
        if (!hasCourse) {
          return err({
            message: 'CourseId not found',
            statusCode: 400,
          });
        }
        // calculate displayOrder of unit
        if (!createDto.displayOrder) {
          // get unit has max displayOrder in the same course
          const lastUnit = await this.unitModel
            .findOne({ courseId: createDto.courseId })
            .sort({ displayOrder: -1 })
            .select({ displayOrder: 1 })
            .lean();

          createDto.displayOrder = lastUnit ? lastUnit.displayOrder + 1 : 1;
        } else {
          const isExistDisplayOrder = await this.unitModel.findOne({
            courseId: createDto.courseId,
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

      const modelInstance = new this.unitModel(createDto);
      const createdModel = await modelInstance.save();
      return ok(createdModel.toObject() as Unit);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Result<Unit, AppError>> {
    try {
      let hasUnit = await this.unitModel.findById(id);
      if (!hasUnit) {
        return err({
          message: 'This unit is not exist',
          statusCode: 404,
        });
      } else {
        const targetCourseId = convertToObjectId(
          updateUnitDto.courseId ? updateUnitDto.courseId : hasUnit.courseId,
        );
        const targetDisplayOrder = Number(
          updateUnitDto.displayOrder ? updateUnitDto.displayOrder : hasUnit.displayOrder,
        );
        const hasCourse = await this.courseService.findOne({ _id: targetCourseId });
        if (!hasCourse) {
          return err({ message: 'CourseId not found', statusCode: 400 });
        }
        const isExistingDisplayOrder = await this.unitModel.findOne({
          courseId: targetCourseId,
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

      hasUnit = await this.unitModel.findOneAndUpdate(
        { _id: id },
        {
          ...updateUnitDto,
          courseId: convertToObjectId(
            updateUnitDto.courseId ? updateUnitDto.courseId : hasUnit.courseId,
          ),
        },
        {
          new: true,
        },
      );

      return ok(hasUnit as Unit);
    } catch (e) {
      return err({
        message: 'Error when updating unit',
        statusCode: 500,
        context: updateUnitDto,
        cause: e,
      });
    }
  }
}
