import { UpdateUserDto } from '@app/constracts';
import { Body, Controller, Inject, Patch, Req, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';

@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @Patch('profile')
  updateProfile(
    @Req() req: FastifyRequest,
    @Body() updateData: UpdateUserDto,
    @Res() res: FastifyReply,
  ) {
    const { userId } = (req as any).user;
    this.client.send({ cmd: 'auth.update-profile' }, { userId, updateData }).subscribe({
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
}
