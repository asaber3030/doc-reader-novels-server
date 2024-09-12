import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';
import { createPagination } from '../../utils/pagination';
import { novelsConfig } from 'src/novels/config';
import { CreateTagDto, UpdateTagDto } from './dto';

@Injectable()
export class TagsService {
  constructor(private readonly db: DatabaseService) {}

  async getTags({
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

    const totalTags = await this.db.novelTag.count();
    const totalPages = Math.ceil(totalTags / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const tags = await this.db.novelTag.findMany({
      where: {
        tag: {
          contains: searchParam,
        },
      },
      orderBy: { [orderBy]: orderType },
      take: limit,
      skip,
    });

    return {
      message: 'Tags Data',
      statusCode: 200,
      data: tags,
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
    };
  }

  async getTagById(tagId: number) {
    const tag = await this.db.novelTag.findUnique({
      where: { id: tagId },
    });
    if (!tag) throw new NotFoundException('التاج غير متواجد');

    return {
      message: 'Tag Data',
      statusCode: 200,
      data: tag,
    };
  }

  async getNovelsByTag(
    tag: string,
    {
      searchParam,
      pageParam,
      skipLimitParam,
      limitParam,
      orderByParam,
      orderTypeParam,
    }: PaginationType,
  ) {
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

    return {
      message: 'Novels Data',
      statusCode: 200,
      data: [],
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
    };
  }

  async createTag(novelId: number, data: CreateTagDto) {
    const tagExists = await this.db.novelTag.findFirst({
      where: { tag: data.tag, novelId },
    });
    if (tagExists) throw new ConflictException('التاج موجود بالفعل');

    const tag = await this.db.novelTag.create({
      data: { novelId, tag: data.tag },
    });
    return {
      message: 'تم انشاء التاج بنجاح',
      statusCode: 201,
      data: tag,
    };
  }

  async updateTag(tagId: number, data: UpdateTagDto) {
    const tagExists = await this.db.novelTag.findFirst({
      where: { tag: data.tag, id: { not: tagId } },
    });
    if (tagExists) throw new ConflictException('القسم موجود بالفعل');

    const tag = await this.db.novelTag.update({
      where: { id: tagId },
      data,
    });
    return {
      message: 'تم تعديل القسم بنجاح',
      statusCode: 200,
      data: tag,
    };
  }

  async deleteTag(tagId: number) {
    const tagExists = await this.db.novelTag.findUnique({
      where: { id: tagId },
    });
    if (!tagExists) throw new NotFoundException('التاج غير موجود بالفعل');

    const novelTag = await this.db.novelTag.delete({
      where: { id: tagId },
    });
    return {
      message: 'تم حذف التاج بنجاح',
      statusCode: 200,
      data: novelTag,
    };
  }
}
