import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();
async function bootstrap() {
  console.log('Starting Users Microservice...');
  console.log(process.env.USER_DB_URI);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
    transport: Transport.TCP,
    options: {
      // host: 'localhost',
      host: '0.0.0.0',
      port: 3001,
    },
  });
  await app.listen();
}
bootstrap();
