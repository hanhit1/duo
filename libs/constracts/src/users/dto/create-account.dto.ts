import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  streakCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  lastActiveAt?: Date;
}
