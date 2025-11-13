// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Result, err, ok } from 'neverthrow';
import {
  AppError,
  ChangePasswordVerifyDto,
  CreateUserDto,
  EmailValidationKey,
  ErrorMessage,
  ForgotPasswordDto,
  forgotPasswordKey,
  GeneratedToken,
  IEmailVerify,
  jwtConstants,
  JwtPayload,
  ResendCodeDto,
  VerifyEmailDto,
} from '@app/constracts';
import { RedisService } from '../redis/redis.service';
import * as dotenv from 'dotenv';
import { EmailService } from 'apps/users/src/email/email.service';
import { User } from 'apps/users/src/schema/user.schema';
import { UserService } from '../user/user.service';
import { RoleDetailService } from '../role-detail/role-detail.service';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private redisService: RedisService,
    private roleDetailService: RoleDetailService,
  ) {}

  async validateUser(user: User, password: string): Promise<Result<User, AppError>> {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return ok(user);
    } else {
      return err({
        message: ErrorMessage.INVALID_PASSWORD,
        statusCode: 401,
      });
    }
  }

  async refreshTokenFromCookie(refreshToken: string): Promise<Result<GeneratedToken, AppError>> {
    try {
      const jwtPayload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: jwtConstants.refresh_secret,
      });

      const userOrError = await this.usersService.findOne({ _id: jwtPayload.userId });

      if (userOrError.isErr() || !userOrError.value) {
        return err({
          message: ErrorMessage.USER_NOT_FOUND,
          statusCode: 404,
          context: jwtPayload,
        });
      }

      return await this.login(userOrError.value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_PROCESSING_REFRESH_TOKEN,
        statusCode: 401,
        context: { refreshToken },
      });
    }
  }

  async login(user: User): Promise<Result<GeneratedToken, AppError>> {
    try {
      const payload: JwtPayload = {
        userId: user._id.toString(),
        roleId: user.roleId.toString(),
        permissions: [], // to be implemented
      };
      const permissionsOfUser = await this.roleDetailService.findOne({ _id: user.roleId });
      if (permissionsOfUser.isOk() && permissionsOfUser.value) {
        payload.permissions = permissionsOfUser.value.permissions;
      }
      const access_token = this.jwtService.sign(payload, { secret: jwtConstants.secret });
      const refresh_token = this.jwtService.sign(payload, {
        secret: jwtConstants.refresh_secret,
        // expiresIn: '100d',
      });
      console.log('access_token: ', access_token);
      return ok({
        access_token: access_token,
        refresh_token: refresh_token,
      } as GeneratedToken);
    } catch (e) {
      // console.error(e);
      return err({
        message: ErrorMessage.ERROR_WHEN_GENERATING_TOKEN,
        cause: e,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout({ _id: userId }: { _id: string }) {
    try {
      return ok({
        message: ErrorMessage.LOGOUT_SUCCESSFULLY,
      });
    } catch (e) {
      return err({
        message: ErrorMessage.ERROR_WHEN_LOGOUT,
        cause: e,
      });
    }
  }

  async registerWithEmail(
    registerDto: CreateUserDto,
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      const verificationDataExists = await this.redisService.getJson<IEmailVerify>(
        EmailValidationKey,
        registerDto.email,
      );
      if (verificationDataExists) {
        return ok({
          message:
            'A verification code is already pending for this email. Please check your email or wait before requesting a new one.',
        });
      }
      // Check if email already exists
      const existingUserResult = await this.usersService.findOne({ email: registerDto.email });
      if (existingUserResult.isOk() && existingUserResult.value) {
        return err({
          message: 'Email already registered',
          statusCode: 400,
        });
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification data as JSON object
      const verificationData: IEmailVerify = {
        code: verificationCode,
        email: registerDto.email,
        password: registerDto.password,
        fullName: registerDto.fullName,
        avatarImage: registerDto.avatarImage,
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      await this.redisService.setJson(
        EmailValidationKey,
        registerDto.email,
        verificationData,
        600, // 10 minutes TTL
      );

      // Send verification email
      const emailResult = await this.emailService.sendVerificationCode(
        registerDto.email,
        verificationCode,
      );

      if (emailResult.isErr()) {
        // Clean up Redis data if email sending fails
        await this.redisService.del(EmailValidationKey, registerDto.email);
        return err(emailResult.error);
      }

      return ok({ message: 'Verification code sent to your email' });
    } catch (error) {
      return err({
        message: 'Registration failed',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async verifyEmail(verifyDto: VerifyEmailDto): Promise<Result<GeneratedToken, AppError>> {
    try {
      // Get verification data from Redis
      const verificationData = await this.redisService.getJson<IEmailVerify>(
        EmailValidationKey,
        verifyDto.email,
      );

      if (!verificationData) {
        return err({
          message: 'Invalid or expired verification code',
          statusCode: 400,
        });
      }

      // Check attempts limit
      if (verificationData.attempts >= 5) {
        await this.redisService.del(EmailValidationKey, verifyDto.email);
        return err({
          message: 'Too many attempts. Please request a new code.',
          statusCode: 400,
        });
      }

      if (verificationData.code !== verifyDto.code) {
        // Increment attempts
        verificationData.attempts += 1;
        const ttl = await this.redisService.ttl(EmailValidationKey, verifyDto.email);
        await this.redisService.setJson(
          EmailValidationKey,
          verifyDto.email,
          verificationData,
          ttl, // Keep the same TTL
        );

        return err({
          message: 'Invalid verification code',
          statusCode: 400,
        });
      }

      const roleIdUser = await this.roleDetailService.findOne({ name: 'User' });

      // Create user account
      const createUserResult = await this.usersService.createUser({
        email: verifyDto.email,
        password: verificationData.password!,
        fullName: verificationData.fullName!,
        avatarImage: verificationData.avatarImage,
        roleId: roleIdUser.isOk() && roleIdUser.value ? roleIdUser.value._id.toString() : '',
        lastActiveAt: new Date(),
        streakCount: 0,
      });

      if (createUserResult.isErr()) {
        return err(createUserResult.error);
      }
      // Clean up verification data
      await this.redisService.del(EmailValidationKey, verifyDto.email);
      const createdUser = createUserResult.value;

      const dataLogin = await this.login(createdUser);
      return dataLogin;
    } catch (error) {
      return err({
        message: 'Email verification failed',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async resendVerificationCode(
    resendDto: ResendCodeDto,
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      const verificationData = await this.redisService.getJson<IEmailVerify>(
        EmailValidationKey,
        resendDto.email,
      );

      if (!verificationData) {
        return err({
          message: 'No pending verification found for this email',
          statusCode: 400,
        });
      }

      if (Date.now() - new Date(verificationData.createdAt).getTime() < 5 * 60 * 1000) {
        return err({
          message: 'Please wait 5 minutes before requesting a new code',
          statusCode: 400,
        });
      }

      // Generate new code
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Update verification data
      const updatedData: IEmailVerify = {
        ...verificationData,
        code: newVerificationCode,
        attempts: 0, // Reset attempts
        createdAt: new Date().toISOString(),
      };
      await this.redisService.setJson(
        EmailValidationKey,
        resendDto.email,
        updatedData,
        600, // Reset TTL
      );

      // Send new verification email
      const emailResult = await this.emailService.sendVerificationCode(
        resendDto.email,
        newVerificationCode,
      );
      if (emailResult.isErr()) {
        return err(emailResult.error);
      }

      return ok({ message: 'New verification code sent to your email' });
    } catch (error) {
      return err({
        message: 'Failed to resend verification code',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      const verificationDataExists = await this.redisService.getJson<IEmailVerify>(
        forgotPasswordKey,
        forgotPasswordDto.email,
      );
      if (verificationDataExists) {
        return ok({
          message:
            'A password reset code is already pending for this email. Please check your email or wait before requesting a new one.',
        });
      }

      const existingUserResult = await this.usersService.findOne({
        email: forgotPasswordDto.email,
      });
      if (existingUserResult.isErr() || !existingUserResult.value) {
        return err({
          message: 'Email not registered',
          statusCode: 400,
        });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const verificationData: IEmailVerify = {
        code: verificationCode,
        email: forgotPasswordDto.email,
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      await this.redisService.setJson(
        forgotPasswordKey,
        forgotPasswordDto.email,
        verificationData,
        600,
      );

      const emailResult = await this.emailService.sendForgotPasswordCode(
        forgotPasswordDto.email,
        verificationCode,
      );

      if (emailResult.isErr()) {
        await this.redisService.del(forgotPasswordKey, forgotPasswordDto.email);
        return err(emailResult.error);
      }

      return ok({ message: 'Forgot password code sent to your email' });
    } catch (error) {
      return err({
        message: 'Forgot password failed',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async verifyChangePassword(
    verifyDto: ChangePasswordVerifyDto,
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      const verificationData = await this.redisService.getJson<IEmailVerify>(
        forgotPasswordKey,
        verifyDto.email,
      );

      if (!verificationData) {
        return err({
          message: 'Invalid or expired verification code',
          statusCode: 400,
        });
      }

      if (verificationData.attempts >= 5) {
        await this.redisService.del(forgotPasswordKey, verifyDto.email);
        return err({
          message: 'Too many attempts. Please request a new code.',
          statusCode: 400,
        });
      }

      if (verificationData.code !== verifyDto.code) {
        verificationData.attempts += 1;
        const ttl = await this.redisService.ttl(forgotPasswordKey, verifyDto.email);
        await this.redisService.setJson(forgotPasswordKey, verifyDto.email, verificationData, ttl);

        return err({
          message: 'Invalid verification code',
          statusCode: 400,
        });
      }

      const updateUserResult = await this.usersService.updatePassword(
        verifyDto.email,
        verifyDto.newPassword,
      );

      if (updateUserResult.isErr()) {
        return err(updateUserResult.error);
      }

      await this.redisService.del(forgotPasswordKey, verifyDto.email);

      return ok({ message: 'Password updated successfully' });
    } catch (error) {
      return err({
        message: 'Email verification failed',
        cause: error,
        statusCode: 500,
      });
    }
  }

  async resendForgotPasswordCode(
    resendDto: ResendCodeDto,
  ): Promise<Result<{ message: string }, AppError>> {
    try {
      const verificationData = await this.redisService.getJson<IEmailVerify>(
        forgotPasswordKey,
        resendDto.email,
      );

      if (!verificationData) {
        return err({
          message: 'No pending verification found for this email',
          statusCode: 400,
        });
      }

      if (Date.now() - new Date(verificationData.createdAt).getTime() < 5 * 60 * 1000) {
        return err({
          message: 'Please wait 5 minutes before requesting a new code',
          statusCode: 400,
        });
      }

      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const updatedData: IEmailVerify = {
        ...verificationData,
        code: newVerificationCode,
        attempts: 0,
        createdAt: new Date().toISOString(),
      };

      await this.redisService.setJson(forgotPasswordKey, resendDto.email, updatedData, 600);

      const emailResult = await this.emailService.sendForgotPasswordCode(
        resendDto.email,
        newVerificationCode,
      );

      if (emailResult.isErr()) {
        return err(emailResult.error);
      }

      return ok({ message: 'New verification code sent to your email' });
    } catch (error) {
      return err({
        message: 'Failed to resend verification code',
        cause: error,
        statusCode: 500,
      });
    }
  }
}
