import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':postId')
  findOne(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.findOne(postId);
  }

  @Patch(':postId')
  update(@Param('postId', ParseIntPipe) postId: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(postId, updatePostDto);
  }

  @Delete(':postId')
  remove(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.remove(postId);
  }
}
