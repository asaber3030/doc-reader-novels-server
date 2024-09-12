import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginationType } from 'types';
import { createPagination } from 'utils/pagination';

@Injectable()
export class AuthorsService {
  constructor(private readonly db: DatabaseService) {}

  async getAuthors({
    searchParam,
    pageParam,
    limitParam,
    orderByParam,
    orderTypeParam,
    skipLimitParam,
  }: PaginationType) {
    const { orderBy, orderType, skip, limit } = createPagination(
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    );

    const totalAuthors = await this.db.user.count();
    const totalPages = Math.ceil(totalAuthors / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const authors = await this.db.user.findMany({
      where: {
        name: {
          contains: searchParam ?? '',
        },
      },
      orderBy: { [orderBy]: orderType },
      skip,
      take: limit,
    });

    return {
      message: 'Author Data',
      statusCode: 200,
      data: authors,
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        currentPage: pageParam,
      },
    };
  }

  async getMostPopularAuthors({ limitParam, searchParam }: PaginationType) {
    const authors = await this.db.user.findMany({
      where: {
        name: {
          contains: searchParam ?? '',
        },
      },
      take: limitParam ?? 10,
      orderBy: { followersCount: 'desc' },
    });

    return {
      message: 'Author Data',
      statusCode: 200,
      data: authors,
    };
  }
}
