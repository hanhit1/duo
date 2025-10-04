import { IsString, IsNotEmpty, IsNumber, IsOptional, MinLength, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  unitId: string;

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
  @IsNumber()
  @IsNotEmpty()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
