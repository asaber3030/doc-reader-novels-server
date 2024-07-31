import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Module({
  providers: [
    UserService
  ],
  controllers: [UserController]
})
export class UserModule {}
