import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TheoryType } from '@app/constracts/common/enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTheoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  unitId?: string;

  @ApiPropertyOptional({ enum: TheoryType })
  @IsOptional()
  @IsEnum(TheoryType)
  @IsNotEmpty()
  typeTheory?: TheoryType;

  // --- COMMON ---
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  // --- GRAMMAR ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsOptional()
  example?: string;

  // --- PHRASE ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE)
  @IsString()
  @IsNotEmpty()
  phraseText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE || o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsNotEmpty()
  translation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE || o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  audio?: string;

  // --- FLASHCARD ---
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  image?: string;
}
