import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApiGatewayModule,
    new FastifyAdapter(),
  );

  await app.register(fastifyCors as any, {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Sửa thành mảng
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Thêm tất cả methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // Thêm headers được phép
    exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header
  });

  await app.register(fastifyMultipart as any, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  await app.register(fastifyCookie as any, {
    secret: 'cookie-secret',
  });
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('The bot-snipe swagger API')
    .setDescription('The bot-snipe swagger API')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.port ?? 3000, '0.0.0.0');
}
bootstrap();
