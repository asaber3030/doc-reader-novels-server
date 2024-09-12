import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UpdateFavouritesDto } from './dto';
import { FavouritesService } from './favourites.service';

@Controller('favourites')
@UseGuards(AuthGuard('jwt'))
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  // Get current user favourites
  @Get()
  async findFavourites(@Req() req: Request) {
    const user = req.user as User;
    return this.favouritesService.currentUserFavourites(user.id);
  }

  // Add to favourites
  @Post()
  async addToFav(@Req() req: Request, @Body() data: UpdateFavouritesDto) {
    const user = req.user as User;
    return this.favouritesService.addToFavourites(user.id, data.novelId);
  }

  // Remove from favourites
  @Delete()
  async removeFromFav(@Req() req: Request, @Body() data: UpdateFavouritesDto) {
    const user = req.user as User;
    return this.favouritesService.removeFromFavourites(user.id, data.novelId);
  }
}
