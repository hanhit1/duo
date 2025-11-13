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
import { ApiBody, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({
    summary: 'Get all roles',
    description: 'This API will return a list of all roles',
  })
  @Permissions('role.view')
  @Get()
  getAllRoles(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.getAll' }, {}).subscribe({
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

  @ApiOperation({
    summary: 'Get all role options',
    description: 'This API will return a list of all role options to implement in combobox',
  })
  @Permissions('role.view')
  @Get('/options')
  getAllOptionsRoles(@Res() res: FastifyReply) {
    this.client.send({ cmd: 'role-detail.options' }, {}).subscribe({
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

  @ApiOperation({
    summary: 'Create a new role',
    description: 'This API will create a new role',
  })
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

  @ApiOperation({
    summary: 'Update permissions of a role',
    description: 'This API will update permissions of a role',
  })
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

  @ApiOperation({
    summary: 'Update name of a role',
    description: 'This API will update name of a role ( prevent update name of Admin role )',
  })
  @Permissions('role-name.update')
  @Patch(':id')
  @ApiBody({ type: UpdateNameOfRoleDto })
  updateNameOfRoleDetail(
    @Param('id') id: string,
    @Body() body: UpdateNameOfRoleDto,
    @Res() res: FastifyReply,
  ) {
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

  @ApiOperation({
    summary: 'Delete a role',
    description: 'This API will delete a role ( prevent delete Admin role )',
  })
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
