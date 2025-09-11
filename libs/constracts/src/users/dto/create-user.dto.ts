import { IsString, IsNotEmpty, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountRole } from '@app/constracts';

export class CreateUserDto {
  @ApiProperty({ enum: AccountRole })
  @IsEnum(AccountRole)
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
