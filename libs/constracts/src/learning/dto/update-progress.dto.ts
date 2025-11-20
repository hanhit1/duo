import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lessonId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unitId: string;
}
