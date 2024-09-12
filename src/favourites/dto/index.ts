import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFavouritesDto {
  @IsNotEmpty()
  @IsNumber()
  novelId: number;
}
