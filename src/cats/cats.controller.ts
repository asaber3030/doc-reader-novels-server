import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Controller('cats')
export class CatsController {

  constructor(private db: DatabaseService) {}

  @Get()
  async cats() {
    return {
      data: await this.db.user.findMany()
    }
  }

}
