import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ItemOfUpdateMistakeDto {
  @ApiProperty({ example: 'unitId1' })
  @IsString()
  unitId: string;

  @ApiProperty({ example: 'questionId1' })
  @IsString()
  questionId: string;
}

export class UpdateMistakeDto {
  @ApiProperty({ type: [ItemOfUpdateMistakeDto] })
  @IsNotEmpty()
  @IsArray()
  correctAnswer: ItemOfUpdateMistakeDto[];
}
