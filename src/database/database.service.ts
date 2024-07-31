import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: { url: "mysql://root@localhost:3306/docreader-novels" }
      }
    })
  }
}
