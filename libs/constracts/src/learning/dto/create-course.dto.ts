import { IsString, IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @Length(10)
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  displayOrder: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  isActive?: boolean;
}
