import { InputType, PickType } from '@nestjs/graphql';
import { Game } from '../entities/game.entity';

@InputType()
export class CreateGameDto extends PickType(Game, ['humanSymbol', 'aiSymbol', 'label'] as const) {}
