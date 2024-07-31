import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { CatsController } from './cats/cats.controller';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule, 
    AuthModule, 
    DatabaseModule, 
    NovelsModule, 
    ChaptersModule, CatsModule
  ],
  controllers: [CatsController]
})

export class AppModule {}
