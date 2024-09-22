import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { createClient } from '@supabase/supabase-js';
import { v4 } from 'uuid';

@Controller('test')
export class TestController {
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET,
      {
        auth: {
          persistSession: false,
        },
      },
    );

    const data = await client.storage
      .from('users')
      .upload(v4() + '-' + file.originalname, file.buffer, {
        upsert: true,
        contentType: file.mimetype,
      });

    return data;
  }
}
