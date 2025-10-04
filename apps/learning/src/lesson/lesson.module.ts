import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { Lesson, lessonSchema } from '../schema/lesson.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { UnitModule } from '../unit/unit.module';
dotenv.config();

@Module({
  imports: [MongooseModule.forFeature([{ name: Lesson.name, schema: lessonSchema }]), UnitModule],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
