import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
  @Get()
  async get() {
    return { message: 'DocReader Novels API', statusCode: 200 };
  }
}
