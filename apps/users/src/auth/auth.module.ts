import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RoleDetailModule } from '../role-detail/role-detail.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    RedisModule,
    EmailModule,
    UserModule,
    RoleDetailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
