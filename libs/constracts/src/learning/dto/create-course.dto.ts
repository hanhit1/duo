import { IsString, IsNotEmpty, IsNumber, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  displayOrder: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
