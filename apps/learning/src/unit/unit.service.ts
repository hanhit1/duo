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
}
