import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { QuestionType } from '@app/constracts/common/enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  // --- COMMON ---
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  typeQuestion: QuestionType;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty()
  @ValidateIf(
    (o) =>
      o.typeQuestion === QuestionType.MATCHING ||
      o.typeQuestion === QuestionType.GAP ||
      o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
  )
  @IsNotEmpty()
  @IsString()
  correctAnswer?: string;

  @ApiProperty()
  @ValidateIf(
    (o) => o.typeQuestion === QuestionType.GAP || o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
  )
  @IsNotEmpty()
  @IsString()
  mediaUrl?: string;

  // --- MATCHING ---
  @ApiProperty()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsNotEmpty()
  @IsString({ each: true })
  leftText?: string[];

  @ApiProperty()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsNotEmpty()
  @IsString({ each: true })
  rightText?: string[];

  // --- ORDERING ---
  @ApiProperty()
  @ValidateIf((o) => o.typeQuestion === QuestionType.ORDERING)
  @IsNotEmpty()
  @IsString({ each: true })
  fragmentText?: string[];

  @ApiProperty()
  @ValidateIf((o) => o.typeQuestion === QuestionType.ORDERING)
  @IsNotEmpty()
  @IsString({ each: true })
  exactFragmentText?: string[];

  // --- MULTIPLE CHOICE ---
  @ApiProperty()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MULTIPLE_CHOICE)
  @IsNotEmpty()
  @IsString({ each: true })
  answers?: string[];
}
