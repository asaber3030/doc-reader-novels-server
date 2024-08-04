import { Body, Controller, Get, Delete, Param, ParseIntPipe, Post, Req, Patch, UseGuards, DefaultValuePipe, Query, ParseBoolPipe } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateNovelDto, UpdateNovelDto } from './dto/novels.dto';
import { AuthGuard } from '@nestjs/passport';
import { FollowDto, UpdateUserDto } from './dto/user.dto';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {

  constructor(private userService: UserService) {}

  @Get()
  async findUser(@Req() req: Request) {
    return { message: "User data", statusCode: 200, data: req.user }
  }

  @Get("all")
  async allUsers(
    @Query("search", new DefaultValuePipe('')) searchParam?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limitParam?: number,
    @Query("orderBy", new DefaultValuePipe("id")) orderByParam?: string,
    @Query("orderType", new DefaultValuePipe("desc")) orderTypeParam?: string,
    @Query("skipLimit", new DefaultValuePipe(false), ParseBoolPipe) skipLimitParam?: boolean,
  ) {
    return this.userService.allUsers({
      searchParam,
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam
    })
  }
  
  @Post("update")
  async update(@Req() req: Request, @Body() data: UpdateUserDto) {
    const user: User = req.user as User
    return this.userService.updateMe(user.id, data)
  }

  @Post("follow")
  async follow(@Req() req: Request, @Body() data: FollowDto) {
    const user: User = req.user as User
    return this.userService.follow(user, data)
  }

  @Post("unfollow")
  async unfollow(@Req() req: Request, @Body() data: FollowDto) {
    const user: User = req.user as User
    return this.userService.unfollow(user, data)
  }

  @Get("novels")
  async findNovels(@Req() req: Request) {
    const user: User = req.user as User
    return await this.userService.userNovels(user)
  }

  @Post("novels/create")
  async createNovel(@Req() req: Request, @Body() createNovelDto: CreateNovelDto) {
    const user: User = req.user as User
    return await this.userService.createNovel(user.id, createNovelDto)
  }

  @Get("novels/:novelId")
  async findNovel(@Param('novelId', ParseIntPipe) novelId: number) {
    return await this.userService.getNovel(novelId)
  }

  @Delete("novels/:novelId/delete")
  async deleteNovel(@Req() req: Request, @Param('novelId', ParseIntPipe) novelId: number) {
    const user: User = req.user as User
    return await this.userService.deleteNovel(user.id, novelId)
  }

  @Patch("novels/:novelId/update")
  async updateNovel(@Req() req: Request, @Param('novelId', ParseIntPipe) novelId: number, @Body() updateNovelDto: UpdateNovelDto) {
    const user: User = req.user as User
    return await this.userService.updateNovel(user.id, novelId, updateNovelDto)
  }
}
