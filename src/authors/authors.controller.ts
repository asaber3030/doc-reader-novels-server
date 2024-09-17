import { AuthorsService } from './authors.service';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  async getAuthors(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.authorsService.getAuthors({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  @Get('most-popular')
  async getMostPopularAuthors(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
  ) {
    return this.authorsService.getMostPopularAuthors({
      searchParam,
      limitParam,
    });
  }

  @Get(':authorId')
  async getAuthor(@Param('categoryId', ParseIntPipe) categoryId: number) {}
}
