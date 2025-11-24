import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMistakeDto {
  @ApiProperty({
    type: [String],
    example: ['questionId1', 'questionId2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  wrongAnswer: string[];
}
