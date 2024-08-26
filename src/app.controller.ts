import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  async get() {
    return { message: 'DocReader Novels API', statusCode: 200 };
  }
}
