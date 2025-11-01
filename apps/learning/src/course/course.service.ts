import { AppError, CRUDService, ErrorMessage, PaginationReq, SortReq } from '@app/constracts';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as dotenv from 'dotenv';
import { Course } from '../schema/course.schema';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { CreateCourseDto } from '@app/constracts';
import { UpdateCourseDto } from '@app/constracts';

dotenv.config();

@Injectable()
export class CourseService extends CRUDService<Course> {
  constructor(@InjectModel(Course.name) private readonly courseModel: Model<Course>) {
    super(courseModel);
  }

  async userGetAllCourse(pagination: PaginationReq): Promise<Result<[Course[], number], AppError>> {
    const sort: SortReq = {
      field: 'displayOrder',
      value: 'ASC',
    };
    const [itemsOrErr, totalRecords] = await Promise.all([
      this.find({}, [], pagination, sort),
      this.courseModel.countDocuments(),
    ]);
    return itemsOrErr.map((items) => [items, totalRecords]);
  }

  async create(createDto: Partial<CreateCourseDto>): Promise<Result<Course, AppError>> {
    try {
      const currentMaxDisplayOrder = await this.courseModel
        .findOne()
        .sort({ displayOrder: -1 })
        .select('displayOrder')
        .lean();
      const nextDisplayOrder = currentMaxDisplayOrder ? currentMaxDisplayOrder.displayOrder + 1 : 1;

      const modelInstance = new this.courseModel({ ...createDto, displayOrder: nextDisplayOrder });
      const createdModel = await modelInstance.save();
      return ok(createdModel.toObject() as Course);
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_CREATING_MODEL,
        statusCode: 500,
        context: createDto,
        cause: e,
      });
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Result<Course, AppError>> {
    try {
      // remove displayOrder from update dto to prevent updating it
      delete updateCourseDto['displayOrder'];

      const course = await this.courseModel.findOneAndUpdate({ _id: id }, updateCourseDto, {
        new: true,
      });

      if (!course) {
        return err({
          message: 'This course is not exist',
          statusCode: 404,
        });
      }

      return ok(course as Course);
    } catch (e) {
      return err({
        message: 'Error when updating course',
        statusCode: 500,
        context: updateCourseDto,
        cause: e,
      });
    }
  }
}
