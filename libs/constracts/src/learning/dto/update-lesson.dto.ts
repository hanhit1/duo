import { IsString, IsOptional, MinLength, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsNumber()
  experiencePoint: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  objectives?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
