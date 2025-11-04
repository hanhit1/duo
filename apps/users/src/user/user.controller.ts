import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserDto, AppError } from '@app/constracts';
import { err, ok } from 'neverthrow';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'auth.update-profile' })
  async updateProfile(@Payload() payload: { userId: string; updateData: UpdateUserDto }) {
    const { userId, updateData } = payload;

    const userOrError = await this.userService.update(userId, updateData);

    return userOrError.match(
      (v) => {
        return ok({
          data: { ...v, password: undefined, role: undefined },
        });
      },
      (e: AppError) => {
        console.log(e);
        return err({ message: e.message });
      },
    );
  }
}
