import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule, 
    AuthModule, 
    DatabaseModule, 
    NovelsModule, 
    ChaptersModule
  ]
})

export class AppModule {}
