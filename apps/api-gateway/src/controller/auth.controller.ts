import {
  ChangePasswordVerifyDto,
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  Public,
  ResendCodeDto,
  VerifyEmailDto,
} from '@app/constracts';
import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FastifyReply, FastifyRequest } from 'fastify';
import { clearCookieForFastifyResp, setCookieForFastifyResp } from '../guard/auth/cookie';
import { ApiCookieAuth } from '@nestjs/swagger';

@ApiCookieAuth()
@Controller('auth')
export class AuthController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
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

  @Public()
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
  refresh(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const refreshToken = req.cookies['refresh_token'];
    this.client.send({ cmd: 'auth.refresh' }, refreshToken).subscribe({
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

  @Public()
  @Post('logout')
  logout(@Res() res: FastifyReply) {
    clearCookieForFastifyResp(res);
    return res.status(200).send({ message: 'Logout successful' });
  }

  @Get('profile')
  getProfile(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { userId } = (req as any).user;
    this.client.send({ cmd: 'auth.get-profile' }, userId).subscribe({
      next: (result: any) => {
        if (result.value) {
          res.status(200).send(result);
        } else {
          res.status(401).send({ message: result.error.message });
        }
      },
      error: () => res.status(500).send({ message: 'Internal server error' }),
    });
  }
}
