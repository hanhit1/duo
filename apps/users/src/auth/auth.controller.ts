import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import {
  AppError,
  ChangePasswordVerifyDto,
  CreateUserDto,
  ErrorMessage,
  ForgotPasswordDto,
  GeneratedToken,
  LoginDto,
  Public,
  ResendCodeDto,
  VerifyEmailDto,
} from '@app/constracts';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { err, ok } from 'neverthrow';

@ApiTags('default')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() loginDto: LoginDto) {
    const userOrError = await this.userService.findOne({ email: loginDto.email });
    if (userOrError.isErr() || !userOrError.value) {
      return err({ message: ErrorMessage.LOGIN_FAILED });
    }

    const user = userOrError.value;
    if (!user || !user.password) {
      return err({ message: ErrorMessage.UNAUTHORIZED });
    }
    const validatedOrError = await this.authService.validateUser(user, loginDto.password);
    if (validatedOrError.isErr()) {
      return err({ message: ErrorMessage.UNAUTHORIZED });
    }

    const userValidated = validatedOrError.value;

    // Gọi service async bình thường
    const genTokenOrError = await this.authService.login(userValidated);

    return genTokenOrError.match(
      (v: GeneratedToken) => {
        return ok({
          data: v,
        });
      },
      (error: AppError) => {
        console.error({ error });
        return err({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.login-google-web' })
  async loginWithGoogleWeb(@Payload() query: any) {
    const { code } = query;
    const genTokenOrError = await this.authService.loginWithGoogleWeb(code);

    return genTokenOrError.match(
      (v: GeneratedToken) => {
        return ok({
          data: v,
        });
      },
      (error: AppError) => {
        console.error({ error });
        return err({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @MessagePattern({ cmd: 'auth.refresh' })
  async refresh(@Payload() refreshToken: string) {
    if (!refreshToken) {
      return err({ message: ErrorMessage.UNAUTHORIZED });
    }

    const result = await this.authService.refreshTokenFromCookie(refreshToken);

    return result.match(
      (tokenData: GeneratedToken) => {
        return ok({ data: tokenData });
      },
      (error: AppError) => err({ message: error.message }),
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.register' })
  async registerWithEmail(@Payload() registerDto: CreateUserDto) {
    const resultOrErr = await this.authService.registerWithEmail(registerDto);
    if (resultOrErr.isOk()) {
      return ok({ message: 'Register successful, please check your email to verify' });
    }
    return err({ message: ErrorMessage.UNAUTHORIZED });
  }

  @Public()
  @MessagePattern({ cmd: 'auth.verify-email' })
  async verifyEmail(@Payload() verifyEmailDto: VerifyEmailDto) {
    const resultOrErr = await this.authService.verifyEmail(verifyEmailDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.resendCode' })
  async resendCode(@Payload() resendCodeDto: ResendCodeDto) {
    const resultOrErr = await this.authService.resendVerificationCode(resendCodeDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: ErrorMessage.UNAUTHORIZED });
      },
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.forgot-password' })
  async forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
    const resultOrErr = await this.authService.forgotPassword(forgotPasswordDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.change-password' })
  async changePassword(@Payload() changePasswordVerifyDto: ChangePasswordVerifyDto) {
    const resultOrErr = await this.authService.verifyChangePassword(changePasswordVerifyDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @Public()
  @MessagePattern({ cmd: 'auth.resend-forgot-password-code' })
  async resendForgotPasswordCode(@Payload() resendDto: ResendCodeDto) {
    const resultOrErr = await this.authService.resendForgotPasswordCode(resendDto);
    return resultOrErr.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }

  @MessagePattern({ cmd: 'auth.get-profile' })
  async getProfile(@Payload() userId: string) {
    const userOrError = await this.userService.getProfile(userId);
    return userOrError.match(
      (v) => {
        return ok({
          data: v,
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }
}
