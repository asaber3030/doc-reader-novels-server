import { PartialType } from "@nestjs/mapped-types"
import { IsAlpha, IsNotEmpty, IsNumber, IsUrl, Length } from "class-validator"

export class CreateNovelDto {
  @IsNotEmpty()
  @Length(3, 255)
  title: string

  @IsNotEmpty()
  @Length(3)
  description: string
  
  @IsNotEmpty()
  @Length(3)
  content: string

  @IsNotEmpty()
  @IsUrl()
  url: string

  @IsNotEmpty()
  @IsUrl()
  image: string

  @IsNotEmpty()
  @IsNumber()
  categoryId: number
}

export class UpdateNovelDto extends PartialType(CreateNovelDto) {}
