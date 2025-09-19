import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { Course, courseSchema } from '../schema/course.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
dotenv.config();

@Module({
  imports: [MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }])],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
