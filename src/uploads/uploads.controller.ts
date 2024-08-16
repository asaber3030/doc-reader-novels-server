import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('uploads')
export class UploadsController {
  @Get(":fileName")
  async getFile(@Param("fileName") fileName: string, @Res() res: Response) {
    const file = join(process.cwd(), 'public', fileName)
    return res.sendFile(file)
  }
}
