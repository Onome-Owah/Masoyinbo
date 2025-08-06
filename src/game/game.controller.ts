import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { GameService } from './game.service';


@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('get-user')
  async getUser(@Req() req) {
    const userId = req.user.userId;
    return this.gameService.getUser(userId);
  }
}
