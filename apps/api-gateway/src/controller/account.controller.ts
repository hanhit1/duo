import { CreateUserDto, PaginationReq, Permissions } from '@app/constracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { PermissionGuard } from '../guard/auth/permission.guard';
import { UpdateAccountDto } from '@app/constracts/users/dto/update-account.dto';

@ApiTags('Account for Admin Website')
@ApiCookieAuth()
@UseGuards(PermissionGuard)
@Controller('accounts')
export class AccountController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @ApiOperation({
    summary: 'Get all accounts for Admin Website',
    description: 'Retrieve a paginated list of all user accounts.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @Permissions('account.view')
  @Get()
  getAllAccountsAdminWebsite(@Query() query: PaginationReq, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'account.getAll' }, query).subscribe({
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
    summary: 'Get one account for Admin Website',
    description: 'Retrieve details of a specific user account by ID.',
  })
  @Permissions('account.view')
  @Get(':id')
  getOneAccount(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'account.getOne' }, id).subscribe({
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
    summary: 'Create account for Admin Website',
    description: 'Create a new user account with the provided details.',
  })
  @ApiBody({ type: CreateUserDto })
  @Permissions('account.create')
  @Post()
  createAccountAdminWebsite(@Body() body: CreateUserDto, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'account.insert' }, body).subscribe({
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
    summary: 'Update account for Admin Website',
    description: 'Update an existing user account with the provided details.',
  })
  @Permissions('account.update')
  @Patch(':id')
  @ApiBody({ type: UpdateAccountDto })
  updateAccountAdminWebsite(
    @Param('id') id: string,
    @Body() body: UpdateAccountDto,
    @Res() res: FastifyReply,
  ) {
    this.client.send({ cmd: 'account.edit' }, { id, body }).subscribe({
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
    summary: 'Delete account for Admin Website',
    description: 'Delete a user account by ID.',
  })
  @Permissions('account.delete')
  @Delete(':id')
  deleteAccountAdminWebsite(@Param('id') id: string, @Res() res: FastifyReply) {
    this.client.send({ cmd: 'account.remove' }, id).subscribe({
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
