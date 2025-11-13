import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsNotAdmin } from './isNotAdmin.dto';

export class UpdateNameOfRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsNotAdmin({ message: 'Tên role không được là "Admin"' })
  name?: string;
}
