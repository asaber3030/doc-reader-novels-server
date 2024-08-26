import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get()
  async get() {
    return { message: 'Doc Reader - Novels API', statusCode: 200 };
  }
}
