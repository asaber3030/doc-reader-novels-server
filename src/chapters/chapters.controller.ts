import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateCommentDto, UpdateChapterDto, UpdateCommentDto } from './dto';
import { Request } from 'express';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';


@Controller('chapters')
@UseGuards(AuthGuard('jwt'))
export class ChaptersController {
  constructor(private service: ChaptersService) {}
  
  @Get(':chapterId')
  findOne(@Param("chapterId", ParseIntPipe) chapterId: number) {
    return this.service.findOne(chapterId)
  }

  @Patch(':chapterId/update')
  update(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Body() updateChapterDto: UpdateChapterDto,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.update(chapterId, user.id, updateChapterDto)
  }

  @Delete(':chapterId/delete')
  delete(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.delete(chapterId, user.id)
  }

  @Post(':chapterId/views/create')
  createView(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.createView(chapterId, user.id)
  }

  @Post(':chapterId/trigger-like')
  triggerLike(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.triggerLike(chapterId, user.id)
  }
  
  @Get(':chapterId/comments')
  chapterComments(
    @Param("chapterId", ParseIntPipe) chapterId: number
  ) {
    return this.service.chapterComments(chapterId)
  }

  @Post(':chapterId/comments/create')
  createComment(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.createComment(chapterId, user.id, createCommentDto)
  }

  @Patch(':chapterId/comments/:commentId/update')
  updateComment(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Param("commentId", ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.updateComment(chapterId, user.id, commentId, updateCommentDto)
  }

  @Delete(':chapterId/comments/:commentId/delete')
  deleteComment(
    @Param("chapterId", ParseIntPipe) chapterId: number,
    @Param("commentId", ParseIntPipe) commentId: number,
    @Req() req: Request
  ) {
    const user = req.user as User
    return this.service.deleteComment(chapterId, user.id, commentId)
  }

}
