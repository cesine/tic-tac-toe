import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game, GameStatus } from './entities/game.entity';

@Injectable()
export class GameService {
  private readonly games = new Map<string, Game>();

  create(createGameDto: CreateGameDto) {
    const id = randomUUID();
    const humanSymbol = createGameDto.humanSymbol ?? 'X';
    const aiSymbol = createGameDto.aiSymbol ?? 'O';
    const game: Game = {
      id,
      status: GameStatus.IN_PROGRESS,
      humanSymbol,
      aiSymbol,
      nextTurn: humanSymbol,
      moveNumber: 0,
      label: createGameDto.label,
    };
    this.games.set(id, game);
    return game;
  }

  findAll() {
    return Array.from(this.games.values());
  }

  findOne(id: string) {
    return this.games.get(id) ?? null;
  }

  update(id: string, updateGameDto: UpdateGameDto) {
    const existing = this.games.get(id);
    if (!existing) {
      return null;
    }
    const nextGame: Game = {
      ...existing,
      ...updateGameDto,
    };
    this.games.set(id, nextGame);
    return nextGame;
  }

  remove(id: string) {
    const existing = this.games.get(id);
    if (!existing) {
      return null;
    }
    this.games.delete(id);
    return existing;
  }
}
