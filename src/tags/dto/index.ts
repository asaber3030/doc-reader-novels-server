import { PartialType } from '@nestjs/swagger';
import { IsAlpha, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  tag: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}
