import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { TheoryService } from './theory.service';
import { TheoryController } from './theory.controller';
import { Theory, theorySchema } from '../schema/theory.schema';
import { UnitModule } from '../unit/unit.module';
dotenv.config();

@Module({
  imports: [MongooseModule.forFeature([{ name: Theory.name, schema: theorySchema }]), UnitModule],
  controllers: [TheoryController],
  providers: [TheoryService],
  exports: [TheoryService],
})
export class TheoryModule {}
