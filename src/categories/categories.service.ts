import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';
import { createPagination } from '../../utils/pagination';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async getCategories({
    searchParam,
    pageParam,
    skipLimitParam,
    limitParam,
    orderByParam,
    orderTypeParam,
  }: PaginationType) {
    const { orderBy, orderType, skip, limit } = createPagination(
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    );

    const totalCategories = await this.db.category.count();
    const totalPages = Math.ceil(totalCategories / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const categories = await this.db.category.findMany({
      where: {
        name: {
          contains: searchParam,
        },
      },
      orderBy: { [orderBy]: orderType },
      take: limit,
      skip,
    });

    return {
      message: 'Categories Data',
      statusCode: 200,
      data: categories,
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
    };
  }

  async getCategoryById(categoryId: number) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    return {
      message: 'Category Data',
      statusCode: 200,
      data: category,
    };
  }

  async getNovelsByCategory(
    categoryId: number,
    {
      searchParam,
      pageParam,
      skipLimitParam,
      limitParam,
      orderByParam,
      orderTypeParam,
    }: PaginationType,
  ) {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const { orderBy, orderType, skip, limit } = createPagination(
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    );

    const totalNovels = await this.db.novel.count();
    const totalPages = Math.ceil(totalNovels / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const novels = await this.db.novel.findMany({
      where: {
        title: {
          contains: searchParam,
        },
        categoryId,
      },
      orderBy: { [orderBy]: orderType },
      take: limit,
      skip,
    });

    return {
      message: 'Novels Data',
      statusCode: 200,
      data: novels,
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
    };
  }

  async createCategory(data: CreateCategoryDto) {
    const categoryExists = await this.db.category.findUnique({
      where: { name: data.name },
    });
    if (categoryExists) throw new ConflictException('القسم موجود بالفعل');

    const category = await this.db.category.create({
      data,
    });
    return {
      message: 'تم انشاء القسم بنجاح',
      statusCode: 201,
      data: category,
    };
  }

  async updateCategory(categoryId: number, data: UpdateCategoryDto) {
    const categoryExists = await this.db.category.findFirst({
      where: { name: data.name, id: { not: categoryId } },
    });
    if (categoryExists) throw new ConflictException('القسم موجود بالفعل');

    const category = await this.db.category.update({
      where: { id: categoryId },
      data,
    });
    return {
      message: 'تم تعديل القسم بنجاح',
      statusCode: 200,
      data: category,
    };
  }

  async deleteCategory(categoryId: number) {
    const categoryExists = await this.db.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) throw new NotFoundException('القسم غير موجود بالفعل');

    const category = await this.db.category.delete({
      where: { id: categoryId },
    });
    return {
      message: 'تم حذف القسم بنجاح',
      statusCode: 200,
      data: category,
    };
  }
}
