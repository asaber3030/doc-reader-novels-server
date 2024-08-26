import { Controller, Get } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  @Get()
  getAll() {
    return { message: 'projects' };
  }
}
