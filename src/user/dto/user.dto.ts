import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { RegisterDto } from "src/auth/dto";

export class FollowDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number
}

export class UpdateUserDto extends PartialType(RegisterDto) {}