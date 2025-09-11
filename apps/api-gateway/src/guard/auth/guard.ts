import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CustomRequest, JwtPayload } from '@app/constracts';
import { jwtConstants } from '@app/constracts';
import { IS_PUBLIC_KEY } from './public.decorator';
import { IS_ADMIN_KEY } from './admin.decorator';
import { AccountRole } from '@app/constracts';
import { ErrorMessage } from '@app/constracts';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const tokens = this.extractTokenFromCookie(request);
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(tokens.access_token, {
        secret: jwtConstants.secret,
      });

      const isAdminFlag = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isAdminFlag) {
        if (payload.role !== AccountRole.Admin) {
          throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
        }
      }

      request.user = payload;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
    }
  }

  private extractTokenFromCookie(request: FastifyRequest) {
    const tokens = {
      access_token: request.cookies['access_token'],
      refresh_token: request.cookies['refresh_token'],
    };
    return tokens;
  }
}
