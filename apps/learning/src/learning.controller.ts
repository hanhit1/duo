import { Controller, Get } from '@nestjs/common';
import { LearningService } from './learning.service';

@Controller()
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get()
  getHello(): string {
    return this.learningService.getHello();
  }
}
