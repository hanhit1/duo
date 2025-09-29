import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { FilterItem, SortReq } from './types';
import { toFilterReq, toSortReq } from './api';

export class GetCommonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value ? toFilterReq(value) : undefined))
  @IsArray()
  filter?: FilterItem[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform((o) => (o.value ? parseInt(o.value) : 1))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform((o) => (o.value ? parseInt(o.value) : 20))
  @IsNumber()
  pageSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform((o) => (o.value ? toSortReq(o.value) : undefined))
  @IsObject()
  sort?: SortReq;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
