import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseError } from 'mongoose';
import * as dotenv from 'dotenv';
import { CourseModule } from './course/course.module';
import { UnitModule } from './unit/unit.module';
import { LessonModule } from './lesson/lesson.module';
import { TheoryModule } from './theory/theory.module';
import { QuestionModule } from './question/question.module';
import { ProgressModule } from './progress/progress.module';
import { MistakeModule } from './mistake/mistake.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.LEARNING_DB_URI as string, {
      retryAttempts: 1,
      retryDelay: 1000,
      connectionErrorFactory: (error: MongooseError) => {
        console.error(error);
        return error;
      },
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 10000,
      socketTimeoutMS: 30000,
    }),
    CourseModule,
    UnitModule,
    LessonModule,
    TheoryModule,
    QuestionModule,
    ProgressModule,
    MistakeModule,
  ],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
