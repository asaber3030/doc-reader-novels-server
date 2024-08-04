import { PartialType } from '@nestjs/swagger';

export class CreatePostDto {}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
