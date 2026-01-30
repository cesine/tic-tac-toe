import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameService } from './game.service';

@Resolver('Game')
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

  @Query('games')
  findAll() {
    return this.gameService.findAll();
  }

  @Query('game')
  findOne(@Args('id') id: string) {
    const game = this.gameService.findOne(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Mutation('createGame')
  create(@Args('input') input: CreateGameDto) {
    return this.gameService.create(input);
  }

  @Mutation('updateGame')
  update(@Args('id') id: string, @Args('input') input: UpdateGameDto) {
    const game = this.gameService.update(id, input);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Mutation('removeGame')
  remove(@Args('id') id: string) {
    const game = this.gameService.remove(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }
}
