import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCommentDto, UpdateChapterDto, UpdateCommentDto } from './dto';

@Injectable()
export class ChaptersService {
  
  constructor(private db: DatabaseService) {}

  async findOne(chapterId: number) {
    const chapter = await this.db.chapter.findUnique({
      where: { id: chapterId },
      include: { _count: { select: { views: true, comments: true, likes: true } } }
    })
    if (!chapter) throw new NotFoundException("هذا الفصل غير موجود")
    return {
      statusCode: 200,
      data: chapter
    }
  }

  async update(chapterId: number, userId: number, dto: UpdateChapterDto) {
    const chapter = await this.db.chapter.findUnique({
      where: { id: chapterId },
    })
    if (!chapter) throw new NotFoundException("هذا الفصل غير موجود")

    const novel = await this.db.novel.findUnique({
      where: { id: chapter.novelId }
    })

    if (!novel) throw new NotFoundException("هذا الرواية لم تعد متواجده.")
    if (novel.userId !== userId) throw new UnauthorizedException("غير مسموح بالتعديل على هذا الفصل.")

    const updatedChapter = await this.db.chapter.update({
      where: { id: chapter.id },
      data: dto
    })

    return {
      statusCode: 200,
      data: updatedChapter
    }
  }

  async delete(chapterId: number, userId: number) {
    const chapter = await this.db.chapter.findUnique({
      where: { id: chapterId }
    })
    
    if (!chapter) throw new NotFoundException("هذا الفصل غير موجود")

    const novel = await this.db.novel.findUnique({
      where: { id: chapter.novelId }
    })

    if (!novel) throw new NotFoundException("هذا الرواية لم تعد متواجده.")
    if (novel.userId !== userId) throw new UnauthorizedException("غير مسموح بالتعديل على هذا الفصل.")

    const deletedChapter = await this.db.chapter.delete({
      where: { id: chapter.id }
    })

    return {
      statusCode: 200,
      data: deletedChapter
    }
  }

  async createView(chapterId: number, userId: number) {
    const chapter = await this.db.chapter.findUnique({
      where: { id: chapterId },
    })
    if (!chapter) throw new NotFoundException("هذا الفصل غير موجود")

    const novel = await this.db.novel.findUnique({
      where: { id: chapter.novelId }
    })

    if (!novel) throw new NotFoundException("هذا الرواية لم تعد متواجده.")
    if (novel.userId !== userId) throw new UnauthorizedException("غير مسموح بالتعديل على هذا الفصل.")

    const viewExists = await this.db.chapterViews.findFirst({
      where: { novelId: novel.id, chapterId, userId }
    })

    if (!viewExists) {
      await this.db.chapterViews.create({
        data: { novelId: novel.id, chapterId, userId }
      })
      await this.db.novel.update({
        where: { id: novel.id },
        data: { viewsCount: novel.viewsCount + 1 }
      })
    }

    return {
      statusCode: 200,
      data: chapter 
    }
  }

  async triggerLike(chapterId: number, userId: number) {
    const chapter = await this.db.chapter.findUnique({
      where: { id: chapterId },
    })
    if (!chapter) throw new NotFoundException("هذا الفصل غير موجود")

    const novel = await this.db.novel.findUnique({
      where: { id: chapter.novelId }
    })
    if (!novel) throw new NotFoundException("هذا الرواية لم تعد متواجده.")

    const likeExists = await this.db.chapterLikes.findFirst({
      where: { novelId: novel.id, chapterId, userId }
    })

    if (!likeExists) {
      await this.db.chapterLikes.create({
        data: { novelId: novel.id, chapterId, userId }
      })
      await this.db.novel.update({
        where: { id: novel.id },
        data: { likesCount: novel.likesCount + 1 }
      })
      return {
        message: "تم الاعجاب بنجاح",
        statusCode: 200
      }
    }

    await this.db.chapterLikes.deleteMany({
      where: { novelId: novel.id, chapterId, userId }
    })
    await this.db.novel.update({
      where: { id: novel.id },
      data: { likesCount: novel.likesCount - 1 === 0 ? 0 : novel.likesCount - 1 }
    })
    
    return {
      statusCode: 200,
      message: "تم ازالة الاعجاب.",
    }
  }

  async chapterComments(chapterId: number) {
    const chapter = await this.db.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) throw new NotFoundException('هذا الفصل غير متواجد')
    const comments = await this.db.chapterComments.findMany({
      where: { chapterId },
      orderBy: { id: "desc" }
    })
    return { statusCode: 200, data: comments }
  }

  async createComment(chapterId: number, userId: number, dto: CreateCommentDto) {
    const chapter = await this.db.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) throw new NotFoundException('هذا الفصل غير متواجد')

    await this.db.chapterComments.create({
      data: { 
        novelId: chapter.novelId,
        chapterId: chapterId,
        userId,
        comment: dto.comment
      }
    })

    return { statusCode: 201, message: "تم اضافة التعليق بنجاح" }
  }

  async updateComment(chapterId: number, userId: number, commentId: number, dto: UpdateCommentDto) {
    const chapter = await this.db.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) throw new NotFoundException('هذا الفصل غير متواجد')

    const comment = await this.db.chapterComments.findUnique({
      where: { id: commentId },
      select: { userId: true, id: true }
    })

    if (!comment || comment.userId !== userId) throw new UnauthorizedException("لا يمكنك تعديل هذا التعليق.")

    await this.db.chapterComments.update({
      where: { id: commentId },
      data: {
        novelId: chapter.novelId,
        chapterId: chapterId,
        userId,
        comment: dto.comment
      }
    })

    return { statusCode: 201, message: "تم تعديل التعليق بنجاح" }
  }

  async deleteComment(chapterId: number, userId: number, commentId: number) {
    const chapter = await this.db.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) throw new NotFoundException('هذا الفصل غير متواجد')

    const comment = await this.db.chapterComments.findUnique({
      where: { id: commentId },
      select: { userId: true, id: true }
    })

    if (!comment || comment.userId !== userId) throw new UnauthorizedException("لا يمكنك مسح هذا التعليق.")

    await this.db.chapterComments.delete({ where: { id: commentId } })
    return { statusCode: 201, message: "تم ازالة التعليق بنجاح" }
  }

}
