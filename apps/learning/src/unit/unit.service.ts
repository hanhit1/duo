import { AppError, CRUDService, ErrorMessage, UpdateUnitDto } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Unit } from '../schema/unit.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
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

  async adminGetAllUnitNotPaginate(): Promise<Result<Unit[], AppError>> {
    const result = await this.unitModel
      .find()
      .select('_id title thumbnail')
      .sort({ displayOrder: 1 })
      .lean();
    return ok(result as Unit[]);
  }

  async create(createDto: Partial<Unit>): Promise<Result<Unit, AppError>> {
    try {
      const currentMaxDisplayOrder = await this.unitModel
        .findOne({ courseId: createDto.courseId })
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean();
      const nextDisplayOrder = currentMaxDisplayOrder ? currentMaxDisplayOrder.displayOrder + 1 : 1;

      const modelInstance = new this.unitModel({ ...createDto, displayOrder: nextDisplayOrder });
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
      }
      // remove displayOrder and courseId from update dto to prevent updating it
      delete updateUnitDto['displayOrder'];
      delete updateUnitDto['courseId'];

      hasUnit = await this.unitModel.findOneAndUpdate({ _id: id }, updateUnitDto, {
        new: true,
      });

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

  async findOneNextUnit(displayOrder: number, courseId: string): Promise<Result<Unit, AppError>> {
    try {
      const unit = await this.unitModel
        .findOne({ displayOrder: { $gt: displayOrder }, courseId: courseId })
        .sort({ displayOrder: 1 })
        .exec();

      if (!unit) {
        const nextCourseOrErr = await this.courseService.findOneNextCourse(courseId);
        if (nextCourseOrErr.isErr()) {
          return err({ message: nextCourseOrErr.error.message });
        }

        const nextCourse = nextCourseOrErr.value;
        const firstUnitOfNextCourse = await this.unitModel
          .findOne({ courseId: nextCourse._id.toString() })
          .sort({ displayOrder: 1 })
          .exec();

        if (!firstUnitOfNextCourse) {
          return err({ message: 'No next unit found.' });
        }
        return ok(firstUnitOfNextCourse as Unit);
      }

      return ok(unit as Unit);
    } catch (error) {
      return err({ message: 'Failed to retrieve next lesson.', cause: error });
    }
  }
}
