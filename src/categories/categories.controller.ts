import { CategoriesService } from './categories.service';
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
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Get all categories
  @Get()
  async getCategories(
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.categoriesService.getCategories({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }

  // Get category by id
  @Get(':categoryId')
  async getCategoryById(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.getCategoryById(categoryId);
  }

  // Update category
  @Patch(':categoryId/update')
  async updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(categoryId, data);
  }

  // Delete category
  @Delete(':categoryId/delete')
  async deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.deleteCategory(categoryId);
  }

  // Create category
  @Post('create')
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.categoriesService.createCategory(data);
  }

  // Get novels by category
  @Get(':categoryId/novels')
  async getNovelsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('search', new DefaultValuePipe('')) searchParam?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query('orderBy', new DefaultValuePipe('id')) orderByParam?: string,
    @Query('orderType', new DefaultValuePipe('desc')) orderTypeParam?: string,
    @Query('skipLimit', new DefaultValuePipe(false), ParseBoolPipe)
    skipLimitParam?: boolean,
  ) {
    return this.categoriesService.getNovelsByCategory(categoryId, {
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    });
  }
}
