import { Controller, Get, Patch, Post } from '@nestjs/common';
import { MistakeService } from './mistake.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import { AppError } from '@app/constracts';
import { CreateMistakeDto } from '@app/constracts/learning/dto/create-mistake.dto';
import { UpdateMistakeDto } from '@app/constracts/learning/dto/update-mistake.dto';
import { pipelineGetMistakeByUser } from './mistake.pipeline';
import { PipelineStage } from 'mongoose';

@Controller()
export class MistakeController {
  constructor(private readonly mistakeService: MistakeService) {}

  @Get()
  @MessagePattern({ cmd: 'mistake.getAllByUser' })
  async getAllMistakeByUser(@Payload() userId: string) {
    const pipeline: PipelineStage[] = pipelineGetMistakeByUser(userId);
    const resultOrErr = await this.mistakeService.aggregate(pipeline);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Post()
  @MessagePattern({ cmd: 'mistake.create' })
  async createMistake(@Payload() createDto: CreateMistakeDto & { userId: string }) {
    const resultOrErr = await this.mistakeService.insert(createDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Patch()
  @MessagePattern({ cmd: 'mistake.update' })
  async updateMistake(@Payload() payload: { body: UpdateMistakeDto; userId: string }) {
    const { body, userId } = payload;
    const resultOrErr = await this.mistakeService.removeMistakes(userId, body);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }
}
