import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const game = this.gameService.findOne(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const game = this.gameService.update(id, updateGameDto);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const game = this.gameService.remove(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }
}
