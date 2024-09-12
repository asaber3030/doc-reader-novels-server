import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTagDto, UpdateTagDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';

@Controller('tags')
@UseGuards(AuthGuard('jwt'))
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // Get all categories
  @Get()
  async getTags(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.tagsService.getTags({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  // Get tag by id
  @Get(':tagId')
  async getTagById(@Param('tagId', ParseIntPipe) tagId: number) {
    return this.tagsService.getTagById(tagId);
  }

  // Update tag
  @Patch(':tagId/update')
  async updateTag(
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() data: UpdateTagDto,
  ) {
    return this.tagsService.updateTag(tagId, data);
  }

  // Delete tag
  @Delete(':tagId/delete')
  async deleteTag(@Param('tagId', ParseIntPipe) tagId: number) {
    return this.tagsService.deleteTag(tagId);
  }

  // Create tag
  @Post('create/:novelId')
  async createTag(
    @Param('novelId', ParseIntPipe) novelId: number,
    @Body() data: CreateTagDto,
  ) {
    return this.tagsService.createTag(novelId, data);
  }

  // Get novels by tag
  @Get(':tag/novels')
  async getNovelsByTag(
    @Param('tagId') tag: string,
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.tagsService.getNovelsByTag(tag, {
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }
}
