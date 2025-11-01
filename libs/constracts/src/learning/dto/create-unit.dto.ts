import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
