import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  WON_HUMAN = 'WON_HUMAN',
  WON_AI = 'WON_AI',
  DRAW = 'DRAW',
}

registerEnumType(GameStatus, { name: 'GameStatus' });

@ObjectType()
export class Game {
  @Field(() => ID)
  id: string;

  @Field(() => GameStatus)
  status: GameStatus;

  @Field()
  humanSymbol: string;

  @Field()
  aiSymbol: string;

  @Field()
  nextTurn: string;

  @Field()
  moveNumber: number;

  @Field({ nullable: true })
  winner?: string;

  @Field({ nullable: true })
  label?: string;
}
