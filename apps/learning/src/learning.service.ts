import { Injectable } from '@nestjs/common';

@Injectable()
export class LearningService {
  getHello(): string {
    return 'Hello World!';
  }
}
