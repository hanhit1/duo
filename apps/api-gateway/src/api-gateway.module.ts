import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './controller/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth/guard';
import { JwtModule } from '@nestjs/jwt';
import { CourseController } from './controller/course.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 },
      },
    ]),
    ClientsModule.register([
      {
        name: 'LEARNING_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 },
      },
    ]),
    JwtModule,
  ],
  controllers: [ApiGatewayController, AuthController, CourseController],
  providers: [
    ApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ApiGatewayModule {}
