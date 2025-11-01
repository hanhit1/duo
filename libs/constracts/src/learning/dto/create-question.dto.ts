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
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MatchingQuestionItemDto } from '@app/constracts/common/types';

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
    (o) => o.typeQuestion === QuestionType.GAP || o.typeQuestion === QuestionType.MULTIPLE_CHOICE,
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
  @ApiProperty({ type: [MatchingQuestionItemDto] })
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsArray()
  @ValidateNested({ each: true }) // validate object inside array by MatchingItemDto
  @Type(() => MatchingQuestionItemDto) // transform plain every object in InputArray to MatchingItemDto instance
  @IsNotEmpty()
  leftText?: MatchingQuestionItemDto[];

  @ApiProperty({ type: [MatchingQuestionItemDto] })
  @ValidateIf((o) => o.typeQuestion === QuestionType.MATCHING)
  @IsArray()
  @ValidateNested({ each: true }) // validate object inside array by MatchingItemDto
  @Type(() => MatchingQuestionItemDto) // transform plain every object in InputArray to MatchingItemDto instance
  @IsNotEmpty()
  rightText?: MatchingQuestionItemDto[];

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
