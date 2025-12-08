import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty()
  @IsNumber()
  experiencePoint: number;

  @ApiProperty()
  @IsNumber()
  heartCount: number;
}
