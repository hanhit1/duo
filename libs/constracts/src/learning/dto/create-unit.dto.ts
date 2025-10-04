import { IsString, IsNotEmpty, IsNumber, IsOptional, MinLength, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
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
  @IsNumber()
  @IsNotEmpty()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;
}
