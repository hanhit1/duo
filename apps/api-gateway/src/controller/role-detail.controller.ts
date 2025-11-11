import { Permissions } from '@app/constracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';
import { UpdateNameOfRoleDto } from '@app/constracts/users/dto/update-roleDetail.dto';
import { UpdatePermissionsOfRoleDto } from '@app/constracts/users/dto/update-permissions.dto';

@ApiTags('Roles')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('roles')
export class RoleDetailController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @Permissions('role.view')
  @Get()
  getAllRoles(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.getAll' }, {}).subscribe({
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

  @Permissions('role.create')
  @Post()
  createRoleDetail(@Body() dto: { name: string }, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.insert' }, dto).subscribe({
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

  @Permissions('role.setup')
  @Put('setup')
  @ApiBody({ type: [UpdatePermissionsOfRoleDto] })
  updatePermissionsOfRole(@Body() body: UpdatePermissionsOfRoleDto[], @Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.setup' }, body).subscribe({
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

  @Permissions('role-name.update')
  @Patch(':id')
  @ApiBody({ type: UpdateNameOfRoleDto })
  updateNameOfRoleDetail(@Param('id') id: string, @Body() body, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail-name.update' }, { id, body }).subscribe({
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

  @Permissions('role.delete')
  @Delete(':id')
  deleteRoleDetail(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.delete' }, id).subscribe({
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
