import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { Unit, unitSchema } from '../schema/unit.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { CourseModule } from '../course/course.module';
dotenv.config();

@Module({
  imports: [MongooseModule.forFeature([{ name: Unit.name, schema: unitSchema }]), CourseModule],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
