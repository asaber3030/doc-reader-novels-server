import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateNovelDto, UpdateNovelDto } from './dto/novels.dto';

@Injectable()
export class UserService {

  constructor(private db: DatabaseService) {}

  async userNovels(user: User) {
    const novels = await this.db.novel.findMany({
      where: { userId: user.id }
    })
    return {
      statusCode: 200,
      message: "User Novels",
      data: novels
    }
  }

  async getNovel(id: number) {
    const novel = await this.db.novel.findUnique({
      where: { id },
      include: { category: true }
    })
    if (!novel) throw new NotFoundException("هذه الرواية غير موجوده")
    return {
      statusCode: 200,
      message: "User Novels",
      data: novel
    }
  }

  async createNovel(userId: number, dto: CreateNovelDto) {
    const findCategory = await this.db.category.findUnique({
      where: { id: dto.categoryId }
    })
    if (!findCategory) throw new NotFoundException("هذه القسم غير متواجد!")

    const newNovel = await this.db.novel.create({
      data: { ...dto, userId }
    })

    return {
      statusCode: 201,
      message: "تم اضافة رواية جديده!",
      data: newNovel
    }
  }

  async updateNovel(userId: number, novelId: number, dto: UpdateNovelDto) {
    
    const novel = await this.db.novel.findUnique({
      where: { id: novelId }
    })

    if (!novel) throw new NotFoundException("هذه الرواية غير موجوده")
    if (novel.userId !== userId) throw new UnauthorizedException();

    const updatedNovel = await this.db.novel.update({ 
      where: { id: novelId },
      data: dto
    })

    return {
      statusCode: 200,
      message: "تم تعديل الرواية.",
      data: updatedNovel
    }
  }

  async deleteNovel(userId: number, novelId: number) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId }
    })
    if (!novel) throw new NotFoundException("هذه الرواية غير موجوده")
    if (novel.userId !== userId) throw new UnauthorizedException();

    const deletedNovel = await this.db.novel.delete({ where: { id: novelId } })

    return {
      statusCode: 200,
      message: "تم مسح الرواية.",
      data: deletedNovel
    }
  }
  
}
