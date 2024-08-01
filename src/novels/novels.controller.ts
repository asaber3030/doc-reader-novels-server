import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateChapterDto } from 'src/chapters/dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('novels')
@UseGuards(AuthGuard('jwt'))
export class NovelsController {
  constructor(private novelsService: NovelsService) {}

  @Get()
  async novels(
    @Query("search", new DefaultValuePipe('')) searchParam?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query("orderBy", new DefaultValuePipe("id")) orderByParam?: string,
    @Query("orderType", new DefaultValuePipe("desc")) orderTypeParam?: string,
    @Query("skipLimit", new DefaultValuePipe(false), ParseBoolPipe) skipLimitParam?: boolean,
  ) {
    return this.novelsService.novels({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam
    })
  }

  @Get("user/:userId")
  async userNovels(
    @Param("userId", ParseIntPipe) userId: number,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query("orderBy", new DefaultValuePipe("id")) orderByParam?: string,
    @Query("orderType", new DefaultValuePipe("desc")) orderTypeParam?: string,
    @Query("skipLimit", new DefaultValuePipe(false), ParseBoolPipe) skipLimitParam?: boolean,
  ) {
    return this.novelsService.userNovels(userId, {
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam
    })
  }

  @Get(":novelId")
  async findNovel(@Param("novelId", ParseIntPipe) novelId: number) {
    return this.novelsService.findNovel(novelId)
  }

  @Get(":novelId/chapters")
  async findChapters(@Param("novelId", ParseIntPipe) novelId: number) {
    return this.novelsService.findChapters(novelId)
  }

  @Post(":novelId/chapters/create")
  async createChapter(
    @Param("novelId", ParseIntPipe) novelId: number,
    @Body() createChapterDto: CreateChapterDto
  ) {
    return this.novelsService.createChapter(novelId, createChapterDto)
  }

}
