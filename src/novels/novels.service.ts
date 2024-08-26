import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChapterDto } from 'src/chapters/dto';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';

@Injectable()
export class NovelsService {
  constructor(private db: DatabaseService) {}

  async findNovel(novelId: number) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
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
    const novels = await this.db.novel.findMany();

    return {
      message: 'Novel Data',
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
    const novels = await this.db.novel.findMany();

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
