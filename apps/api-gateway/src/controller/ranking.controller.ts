import { Public } from '@app/constracts';
import { Controller, Get, Inject, Res } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

@ApiCookieAuth()
@Controller('rankings')
export class RankingController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @ApiOperation({
    summary: 'Get ranking by experience points',
    description: 'Retrieve a list of users ranked by their experience points.',
  })
  @Public()
  @Get('exp')
  getRankingByExp(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'ranking.viewByExp' }, {}).subscribe({
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
