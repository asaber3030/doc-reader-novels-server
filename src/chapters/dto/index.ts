import { PartialType } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber } from "class-validator"

// Chapters
export class CreateChapterDto {
  @IsNotEmpty()
  title: string

  @IsNotEmpty()
  @IsNumber()
  number: number
}
export class UpdateChapterDto extends PartialType(CreateChapterDto) {}

// Comments
export class CreateCommentDto {
  @IsNotEmpty()
  comment: string
}
export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
