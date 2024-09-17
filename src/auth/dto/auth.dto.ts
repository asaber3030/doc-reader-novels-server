import { PartialType } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  @IsLowercase({ message: 'Username must be lowercase.' })
  @MinLength(1)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto extends PartialType(RegisterDto) {}
