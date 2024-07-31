import { Module } from '@nestjs/common';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Module({
  controllers: [NovelsController,],
  providers: [
    NovelsService,
    { provide: APP_GUARD, useClass: AuthGuard('jwt') },
  ]
})
export class NovelsModule {}
