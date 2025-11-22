import { IsString, IsNotEmpty, IsOptional, MinLength, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  unitId: string;

  @ApiProperty()
  @IsNumber()
  experiencePoint: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  objectives?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
