import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game, GameStatus } from './types/game.types';

@Injectable()
export class GameService {
  private readonly games = new Map<string, Game>();

  create(createGameDto: CreateGameDto): Game {
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

  findAll(): Game[] {
    return Array.from(this.games.values());
  }

  findOne(id: string): Game | null {
    return this.games.get(id) ?? null;
  }

  update(id: string, updateGameDto: UpdateGameDto): Game | null {
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

  remove(id: string): Game | null {
    const existing = this.games.get(id);
    if (!existing) {
      return null;
    }
    this.games.delete(id);
    return existing;
  }
}
