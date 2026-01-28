import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';

@Resolver(() => Game)
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

  @Query(() => [Game], { name: 'games' })
  findAll() {
    return this.gameService.findAll();
  }

  @Query(() => Game, { name: 'game', nullable: true })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.gameService.findOne(id);
  }

  @Mutation(() => Game)
  createGame(@Args('input', { type: () => CreateGameDto }) input: CreateGameDto) {
    return this.gameService.create(input);
  }

  @Mutation(() => Game, { nullable: true })
  updateGame(
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => UpdateGameDto }) input: UpdateGameDto,
  ) {
    return this.gameService.update(id, input);
  }

  @Mutation(() => Game, { nullable: true })
  removeGame(@Args('id', { type: () => String }) id: string) {
    return this.gameService.remove(id);
  }
}
