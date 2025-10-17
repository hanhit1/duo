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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuestionDto {
  // --- COMMON ---
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  lessonId: string;

  @ApiPropertyOptional({ enum: QuestionType })
  @IsOptional()
  @IsEnum(QuestionType)
  @IsNotEmpty()
  typeQuestion: QuestionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.typeQuestion === QuestionType.MATCHING ||
      o.typeQuestion === QuestionType.GAP ||
      o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
  )
  @IsNotEmpty()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(
    (o) => o.typeQuestion === QuestionType.GAP || o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
  )
  @IsNotEmpty()
  @IsString()
  mediaUrl?: string;

  // --- MATCHING ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsNotEmpty()
  @IsString({ each: true })
  leftText?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsNotEmpty()
  @IsString({ each: true })
  rightText?: string[];

  // --- ORDERING ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.ORDERING)
  @IsNotEmpty()
  @IsString({ each: true })
  fragmentText?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.ORDERING)
  @IsNotEmpty()
  @IsString({ each: true })
  exactFragmentText?: string[];

  // --- MULTIPLE CHOICE ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MULTIPLE_CHOICE)
  @IsNotEmpty()
  @IsString({ each: true })
  answers?: string[];
}
