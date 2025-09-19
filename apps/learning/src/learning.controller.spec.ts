import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

describe('LearningController', () => {
  let learningController: LearningController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
      providers: [LearningService],
    }).compile();

    learningController = app.get<LearningController>(LearningController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(learningController.getHello()).toBe('Hello World!');
    });
  });
});
