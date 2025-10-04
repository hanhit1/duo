import { AppError, CRUDService, ErrorMessage, UpdateUnitDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Unit } from '../schema/unit.schema';
import { Model, Types } from 'mongoose';
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
        createDto.courseId = new Types.ObjectId(createDto.courseId as any);
        const hasCourse = this.courseService.findOne({ _id: createDto.courseId });
        if (!hasCourse) {
          return err({
            message: 'CourseId not found',
            statusCode: 400,
          });
        }
      }
      if (!createDto.displayOrder) {
        createDto.displayOrder = (await this.unitModel.countDocuments()) + 1;
      } else {
        const isExistDisplayOrder = await this.unitModel.findOne({
          displayOrder: Number(createDto.displayOrder),
        });
        if (isExistDisplayOrder) {
          return err({
            message: 'Display order already exists',
            statusCode: 400,
          });
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
      if (updateUnitDto.courseId) {
        updateUnitDto.courseId = new Types.ObjectId(updateUnitDto.courseId as any) as any;
        const hasCourse = this.courseService.findOne({ _id: updateUnitDto.courseId });
        if (!hasCourse) {
          return err({
            message: 'CourseId not found',
            statusCode: 400,
          });
        }
      }

      if (updateUnitDto.displayOrder) {
        const isExist = await this.unitModel.findOne({
          displayOrder: +updateUnitDto.displayOrder,
          _id: { $ne: convertToObjectId(id) },
        });

        if (isExist) {
          return err({
            message: 'Display order already exists',
            statusCode: 400,
          });
        }
      }

      const course = await this.unitModel.findOneAndUpdate({ _id: id }, updateUnitDto, {
        new: true,
      });

      if (!course) {
        return err({
          message: 'This unit is not exist',
          statusCode: 404,
        });
      }

      return ok(course as Unit);
    } catch (e) {
      return err({
        message: 'Error when updating course',
        statusCode: 500,
        context: updateUnitDto,
        cause: e,
      });
    }
  }
}
