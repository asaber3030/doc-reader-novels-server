import { Module } from '@nestjs/common';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { AuthGuard } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

@Module({
  controllers: [ChaptersController],
  providers: [ChaptersService]
})
export class ChaptersModule {}
