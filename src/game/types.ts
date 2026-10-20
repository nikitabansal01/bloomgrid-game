export type PlacedBlock = {
  id: string;
  x: number;
  y: number;
  width: number;
  color: string;
  perfect: boolean;
};

export type GamePhase = 'playing' | 'gameover';

export type RunStats = {
  score: number;
  perfects: number;
  maxCombo: number;
  sessionStartedAt: number;
};
