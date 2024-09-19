import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsUrl, Length } from 'class-validator';

export class CreateNovelDto {
  @IsNotEmpty()
  @Length(3, 255)
  title: string;

  @IsNotEmpty()
  @Length(3)
  description: string;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}

export class UpdateNovelDto extends PartialType(CreateNovelDto) {}
