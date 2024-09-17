import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChapterDto } from 'src/chapters/dto';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';
import { createPagination } from '../../utils/pagination';
import { novelsConfig } from './config';
import { CreateManyNovelTagsDto, CreateNovelTagDto } from './dto';

@Injectable()
export class NovelsService {
  constructor(private db: DatabaseService) {}

  async findNovel(novelId: number) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
      include: {
        user: { select: { name: true, username: true, id: true } },
        category: true,
        chapters: true,
        tags: { select: { tag: true } },
      },
    });

    const tagArray = novel?.tags?.map((tag) => tag.tag);

    if (!novel) throw new NotFoundException('هذه الرواية غير متواجده.');
    return { message: 'Novel Data', data: { ...novel, tags: tagArray } };
  }

  async findChapters(novelId: number) {
    const chapters = await this.db.chapter.findMany({
      where: { novelId },
      include: {
        _count: { select: { views: true, comments: true, likes: true } },
      },
      orderBy: { number: 'asc' },
    });
    return {
      statusCode: 200,
      data: chapters,
    };
  }

  async novels({
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

    const totalNovels = await this.db.novel.count();
    const totalPages = Math.ceil(totalNovels / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const novels = await this.db.novel.findMany({
      select: novelsConfig.select,
      where: {
        title: {
          contains: searchParam,
        },
      },
      orderBy: { [orderBy]: orderType },
      take: limit,
      skip,
    });

    return {
      message: 'Novel Data',
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

  async getMostPopularNovels({ searchParam, limitParam }: PaginationType) {
    const novels = await this.db.novel.findMany({
      select: novelsConfig.select,
      where: {
        title: {
          contains: searchParam,
        },
      },
      orderBy: { viewsCount: 'desc' },
      take: limitParam ?? 10,
    });

    return {
      message: 'Most Popular Novels Data',
      statusCode: 200,
      data: novels,
    };
  }

  async userNovels(
    userId: number,
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

    const novels = await this.db.novel.findMany({
      select: novelsConfig.select,
      where: {
        title: {
          contains: searchParam,
        },
        userId,
      },
      orderBy: { [orderBy]: orderType },
      skip,
      take: limit,
    });

    return {
      message: 'Novel Data',
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

  async createChapter(novelId: number, createChapterDto: CreateChapterDto) {
    const novel = await this.db.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('هذه الروايه غير موجوده');

    const lastChapterNumber =
      (
        await this.db.chapter.findFirst({
          where: { novelId },
          orderBy: { id: 'desc' },
        })
      )?.number ?? 1;

    const nextChapterNumber = lastChapterNumber + 1;

    const newChapter = await this.db.chapter.create({
      data: { novelId, ...createChapterDto, number: nextChapterNumber },
    });

    await this.db.novel.update({
      where: { id: novelId },
      data: { chaptersCount: { increment: 1 } },
    });

    return {
      message: 'تم اضافة فصل جديد.',
      statusCode: 201,
      data: newChapter,
    };
  }

  async createNovelTag(novelId: number, createNovelTagDto: CreateNovelTagDto) {
    const novel = await this.db.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('هذه الروايه غير موجوده');

    const findTag = await this.db.novelTag.findFirst({
      where: { tag: createNovelTagDto.tag, novelId },
    });
    if (findTag) throw new ConflictException('هذا التاج موجود من قبل.');

    const newNovelTag = await this.db.novelTag.create({
      data: { novelId, ...createNovelTagDto },
    });

    return {
      message: 'تم اضافة تاج جديد.',
      statusCode: 201,
      data: newNovelTag,
    };
  }

  async createManyNovelTags(
    novelId: number,
    createNovelTagDto: CreateManyNovelTagsDto,
  ) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
      select: { id: true },
    });
    if (!novel) throw new NotFoundException('هذه الروايه غير موجوده');

    createNovelTagDto.tags.forEach(async (tag) => {
      const findTag = await this.db.novelTag.findFirst({
        where: { tag: tag.tag, novelId },
      });
      if (findTag)
        throw new ConflictException(`${tag.tag} - هذا التاج موجود من قبل.`);

      await this.db.novelTag.create({
        data: { novelId, tag: tag.tag },
      });
    });

    return {
      message: 'تم اضافة التاجات بنجاح.',
      statusCode: 201,
    };
  }

  async deleteNovelTag(novelId: number, tag: string) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
      select: { id: true },
    });
    if (!novel) throw new NotFoundException('هذه الروايه غير موجوده');

    const findTag = await this.db.novelTag.findFirst({
      where: { tag, novelId },
    });

    if (!findTag) throw new NotFoundException('هذا التاج غير موجود');
    await this.db.novelTag.deleteMany({ where: { novelId, tag } });

    return {
      message: 'تم حذف التاج بنجاح.',
      statusCode: 200,
    };
  }
}
