import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './schema/user.schema';
import { UsersService } from './users.service';
import { MongooseError } from 'mongoose';
import * as dotenv from 'dotenv';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
dotenv.config();

const DB_URI = process.env.DB_URI || 'mongodb+srv://duo:ganganghe@duo.7ixphil.mongodb.net/';
@Module({
  imports: [
    MongooseModule.forRoot(DB_URI, {
      retryAttempts: 1,
      retryDelay: 1000,
      connectionErrorFactory: (error: MongooseError) => {
        console.error(error);
        return error;
      },
      maxPoolSize: 10,
      minPoolSize: 0,
      connectTimeoutMS: 30000,
      maxIdleTimeMS: 10000,
      socketTimeoutMS: 30000,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    RedisModule,
    AuthModule,
    EmailModule,
    UserModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
