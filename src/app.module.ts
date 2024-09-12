import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { PostsModule } from './posts/posts.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadsModule } from './uploads/uploads.module';
import { AppController } from './app.controller';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthorsModule } from './authors/authors.module';
import { FavouritesModule } from './favourites/favourites.module';
import { TagsModule } from './tags/tags.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  controllers: [AppController],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    DatabaseModule,
    NovelsModule,
    ChaptersModule,
    PostsModule,
    UploadsModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './public',
      }),
    }),
    AuthorsModule,
    FavouritesModule,
    TagsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
