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

dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb+srv://duo:ganganghe@duo.7ixphil.mongodb.net/duo';

@Module({
  imports: [
    MongooseModule.forRoot(DB_URI, {
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
  ],
  controllers: [LearningController],
  providers: [LearningService],
})
export class LearningModule {}
