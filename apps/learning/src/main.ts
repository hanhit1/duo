import { NestFactory } from '@nestjs/core';
import { LearningModule } from './learning.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  console.log('Starting Learning Microservice...');
  console.log(process.env.DB_URI);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LearningModule, {
    transport: Transport.TCP,
    options: {
      // host: 'localhost',
      host: '0.0.0.0',
      port: 3002,
    },
  });
  await app.listen();
}
bootstrap();
