import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Post(':productId')
  toggle(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get(':productId/check')
  check(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.favoritesService.isFavorite(userId, productId);
  }
}
