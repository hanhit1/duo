import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, progressSchema } from '../schema/progress.schema';
import { ProgressService } from './progress.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Progress.name, schema: progressSchema }])],
  controllers: [],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
