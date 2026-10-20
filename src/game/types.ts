export type StackBlock = {
  x: number;
  width: number;
  color: string;
};

export type GamePhase = 'menu' | 'playing' | 'gameOver';

export type RunSnapshot = {
  stack: StackBlock[];
  score: number;
  movingX: number;
  direction: 1 | -1;
  speed: number;
};
