import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, MinLength } from 'class-validator';
import { RegisterDto } from 'src/auth/dto';
import { Match } from './decorators';

export class FollowDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  @Match('newPassword', { message: 'كلمات المرور غير متماثلة' })
  confirmationPassword: string;
}

export class UpdateUserDto extends PartialType(RegisterDto) {}
