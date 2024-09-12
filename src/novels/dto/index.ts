import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateNovelTagDto {
  @IsString()
  @IsNotEmpty()
  tag: string;
}

export class UpdateNovelTagDto extends PartialType(CreateNovelTagDto) {}

export class CreateManyNovelTagsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateNovelTagDto)
  tags: CreateNovelTagDto[];
}
