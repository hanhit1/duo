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
import { ApiProperty } from '@nestjs/swagger';

export class CreateTheoryDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ enum: TheoryType })
  @IsEnum(TheoryType)
  @IsNotEmpty()
  typeTheory: TheoryType;

  // --- COMMON ---
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE || o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsNotEmpty()
  translation?: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE || o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  audio?: string;

  // --- GRAMMAR ---
  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.GRAMMAR)
  @IsString()
  @IsOptional()
  example?: string;

  // --- PHRASE ---
  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.PHRASE)
  @IsString()
  @IsNotEmpty()
  phraseText: string;

  // --- FLASHCARD ---
  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @ApiProperty()
  @ValidateIf((o) => o.typeTheory === TheoryType.FLASH_CARD)
  @IsString()
  @IsOptional()
  image?: string;
}
