import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiGatewayModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyCookie as any, {
    secret: 'cookie-secret',
  });
  app.setGlobalPrefix('/api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
