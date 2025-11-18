import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, progressSchema } from '../schema/progress.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { LessonModule } from '../lesson/lesson.module';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Progress.name, schema: progressSchema }]),
    UnitModule,
    LessonModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
