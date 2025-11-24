import { forwardRef, Module } from '@nestjs/common';

import * as dotenv from 'dotenv';

import { MongooseModule } from '@nestjs/mongoose';
import { Mistake, mistakeSchema } from '../schema/mistake.schema';
import { MistakeController } from './mistake.controller';
import { MistakeService } from './mistake.service';
import { LessonModule } from '../lesson/lesson.module';
import { QuestionModule } from '../question/question.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mistake.name, schema: mistakeSchema }]),
    forwardRef(() => QuestionModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [MistakeController],
  providers: [MistakeService],
})
export class MistakeModule {}
