import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleDetail, roleDetailSchema } from '../schema/role-detail.schema';
import { RoleDetailController } from './role-detail.controller';
import { RoleDetailService } from './role-detail.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: RoleDetail.name, schema: roleDetailSchema }])],
  controllers: [RoleDetailController],
  providers: [RoleDetailService],
  exports: [RoleDetailService],
})
export class RoleDetailModule {}
