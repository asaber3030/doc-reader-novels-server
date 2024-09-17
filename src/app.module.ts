import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { PostsModule } from './posts/posts.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppController } from './app.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AuthorsModule } from './authors/authors.module';
import { FavouritesModule } from './favourites/favourites.module';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UploadsController } from './uploads/uploads.controller';

import { join } from 'path';
import { UserController } from './user/user.controller';

@Module({
  controllers: [AppController, UploadsController, UserController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MulterModule.register({
      dest: './public',
    }),
    UserModule,
    AuthModule,
    DatabaseModule,
    NovelsModule,
    ChaptersModule,
    PostsModule,
    UploadsModule,
    AuthorsModule,
    FavouritesModule,
    TagsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
