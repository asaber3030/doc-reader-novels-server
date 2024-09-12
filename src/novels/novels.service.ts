import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from 'src/chapters/dto';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';
import { createPagination } from '../../utils/pagination';

@Injectable()
export class NovelsService {
  constructor(private db: DatabaseService) {}

  async findNovel(novelId: number) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
      include: { user: true, category: true, chapters: true },
    });
    if (!novel) throw new NotFoundException('هذه الرواية غير متواجده.');
    return { message: 'Novel Data', data: novel };
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
    const totalPages = Math.ceil(totalNovels / limitParam);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const novels = await this.db.novel.findMany({
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
        totalNovels,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
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

    const novels = await this.db.novel.findMany({
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
    };
  }

  async createChapter(novelId: number, createChapterDto: CreateChapterDto) {
    const novel = await this.db.novel.findUnique({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('هذه الروايه غير موجوده');

    const newChapter = await this.db.chapter.create({
      data: { novelId, ...createChapterDto },
    });

    return {
      message: 'تم اضافة فصل جديد.',
      statusCode: 201,
      data: newChapter,
    };
  }
}
