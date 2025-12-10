import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '@app/constracts/common/enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchingQuestionItemDto } from '@app/constracts/common/types';

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
    (o) => o.typeQuestion === QuestionType.GAP || o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
  )
  @IsNotEmpty()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf(
    (o) =>
      (o.typeQuestion === QuestionType.GAP || o.typeQuestion === QuestionType.MULTIPLE_CHOICE) &&
      o.mediaUrl != null,
  )
  @IsNotEmpty()
  @IsString()
  mediaUrl?: string;

  // --- MATCHING ---
  @ApiPropertyOptional({ type: [MatchingQuestionItemDto] })
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsArray()
  @ValidateNested({ each: true }) // validate object inside array by MatchingItemDto
  @Type(() => MatchingQuestionItemDto) // transform plain every object in InputArray to MatchingItemDto instance
  @IsNotEmpty()
  leftText?: MatchingQuestionItemDto[];

  @ApiPropertyOptional({ type: [MatchingQuestionItemDto] })
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsArray()
  @ValidateNested({ each: true }) // validate object inside array by MatchingItemDto
  @Type(() => MatchingQuestionItemDto) // transform plain every object in InputArray to MatchingItemDto instance
  @IsNotEmpty()
  rightText?: MatchingQuestionItemDto[];

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

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeQuestion === QuestionType.MULTIPLE_CHOICE && o.title != null)
  @IsNotEmpty()
  @IsString()
  title?: string;
}
