import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateChapterDto } from 'src/chapters/dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateManyNovelTagsDto, CreateNovelTagDto } from './dto';

@Controller('novels')
@UseGuards(AuthGuard('jwt'))
export class NovelsController {
  constructor(private novelsService: NovelsService) {}

  // Novels
  @Get()
  async novels(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.novelsService.novels({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  // Most Popular Novels
  @Get('most-popular')
  async mostPopularNovels(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.novelsService.getMostPopularNovels({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  // User Novels
  @Get('user/:userId')
  async userNovels(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.novelsService.userNovels(userId, {
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  // Find Novel
  @Get(':novelId')
  async findNovel(@Param('novelId', ParseIntPipe) novelId: number) {
    return this.novelsService.findNovel(novelId);
  }

  // Find Chapters
  @Get(':novelId/chapters')
  async findChapters(@Param('novelId', ParseIntPipe) novelId: number) {
    return this.novelsService.findChapters(novelId);
  }

  // Create Chapter
  @Post(':novelId/chapters/create')
  async createChapter(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() createChapterDto: CreateChapterDto,
  ) {
    return this.novelsService.createChapter(novelId, createChapterDto);
  }

  // Create Tag
  @Post(':novelId/tags/create')
  async createNovelTag(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() tag: CreateNovelTagDto,
  ) {
    return this.novelsService.createNovelTag(novelId, tag);
  }

  // Create Many Tags
  @Post(':novelId/tags/create-many')
  async createManyNovelTags(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() tags: CreateManyNovelTagsDto,
  ) {
    return this.novelsService.createManyNovelTags(novelId, tags);
  }

  // Delete Tag
  @Delete(':novelId/tags/delete')
  async deleteTag(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() data: CreateNovelTagDto,
  ) {
    return this.novelsService.deleteNovelTag(novelId, data.tag);
  }
}
