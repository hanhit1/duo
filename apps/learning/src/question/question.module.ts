import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question, questionSchema } from '../schema/question.schema';
import { LessonModule } from '../lesson/lesson.module';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
    LessonModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
