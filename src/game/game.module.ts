import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [GameService, GameResolver],
})
export class GameModule {}
