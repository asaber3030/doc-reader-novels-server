import { Controller, Post, UploadedFile } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';

const storage = diskStorage({
  destination: 'public/',
  filename: (req, file, cb) => {
    const uuid = randomUUID()
    cb(null, file.originalname)
  }
})

@Controller('test')
export class TestController {

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async test(@UploadedFile() file: Express.Multer.File) {
    console.log(file) 
    return { message: "Success", fileName: "http://localhost:8080/public/" + file.filename }
  }

}
