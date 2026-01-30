export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  WON_HUMAN = 'WON_HUMAN',
  WON_AI = 'WON_AI',
  DRAW = 'DRAW',
}

export interface Game {
  id: string;
  status: GameStatus;
  humanSymbol: string;
  aiSymbol: string;
  nextTurn: string;
  moveNumber: number;
  winner?: string;
  label?: string;
}
