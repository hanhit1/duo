import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth/guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 },
      },
    ]),
    JwtModule,
  ],
  controllers: [ApiGatewayController, AuthController],
  providers: [
    ApiGatewayService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ApiGatewayModule {}
