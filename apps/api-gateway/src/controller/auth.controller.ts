import {
  ChangePasswordVerifyDto,
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  Public,
  ResendCodeDto,
  VerifyEmailDto,
} from '@app/constracts';
import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FastifyReply } from 'fastify';
import { clearCookieForFastifyResp, setCookieForFastifyResp } from '../guard/auth/cookie';
import { ApiCookieAuth } from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @Post('login')
  login(@Body() body: LoginDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.login' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          setCookieForFastifyResp(res, result.value.data);
          res.status(200).send('Login successful');
        } else {
          res.status(401).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('register')
  register(@Body() body: CreateUserDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.register' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(201).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('verify-email')
  verifyEmail(@Body() body: VerifyEmailDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.verify-email' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          setCookieForFastifyResp(res, result.value.data);
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('resend-verification-code')
  resendVerificationCode(@Body() body: ResendCodeDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.resendCode' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.forgot-password' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('change-password')
  changePassword(@Body() body: ChangePasswordVerifyDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.change-password' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('resend-password-code')
  resendPasswordCode(@Body() body: ResendCodeDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.resend-password-code' }, body).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(400).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: { refresh_token: string }, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'auth.refresh' }, body.refresh_token).subscribe({
      next: (result: any) => {
        if (result.value) {
          setCookieForFastifyResp(res, result.value.data);
          res.status(200).send(result);
        } else {
          res.status(401).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }

  @Post('logout')
  logout(@Res() res: FastifyReply) {
    clearCookieForFastifyResp(res);
    return res.status(200).send({ message: 'Logout successful' });
  }
}
