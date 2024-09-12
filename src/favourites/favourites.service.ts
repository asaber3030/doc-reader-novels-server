import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FavouritesService {
  constructor(private readonly db: DatabaseService) {}

  // Get current user favourites
  async currentUserFavourites(userId: number) {
    const favouriteNovels = await this.db.favouriteNovel.findMany({
      where: {
        userId,
      },
    });

    return {
      message: 'Favourite novels',
      statusCode: 200,
      data: favouriteNovels,
    };
  }

  // Add to favourites
  async addToFavourites(userId: number, novelId: number) {
    const isFavourite = await this.db.favouriteNovel.findFirst({
      where: {
        userId,
        novelId,
      },
      select: { id: true },
    });

    if (isFavourite) throw new ConflictException('الرواية موجودة في المفضلة');

    const findNovel = await this.db.novel.findUnique({
      where: {
        id: novelId,
      },
    });

    if (!findNovel) throw new NotFoundException('الرواية غير موجودة');

    const favouriteNovel = await this.db.favouriteNovel.create({
      data: {
        userId,
        novelId,
      },
    });
    return {
      message: 'تم اضافة الرواية إلى المفضلة',
      statusCode: 201,
      data: favouriteNovel,
    };
  }

  // Remove from favourites
  async removeFromFavourites(userId: number, novelId: number) {
    const isFavourite = await this.db.favouriteNovel.findFirst({
      where: {
        userId,
        novelId,
      },
      select: { id: true },
    });

    if (!isFavourite)
      throw new ConflictException('الرواية غير موجودة في المفضلة');

    await this.db.favouriteNovel.deleteMany({
      where: {
        userId,
        novelId,
      },
    });

    return {
      message: 'تم ازالة الرواية من المفضلة',
      statusCode: 200,
    };
  }
}
