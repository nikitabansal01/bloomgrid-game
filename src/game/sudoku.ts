export const GRID_SIZE = 6;
export const BOX_ROWS = 2;
export const BOX_COLS = 3;
export const DIGITS = [1, 2, 3, 4, 5, 6] as const;

export type CellNotes = Set<number>;

export function createSeededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxIndex(row: number, col: number): { br: number; bc: number } {
  return {
    br: Math.floor(row / BOX_ROWS),
    bc: Math.floor(col / BOX_COLS),
  };
}

export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  skipRowCol = false,
): boolean {
  if (num === 0) return true;
  for (let c = 0; c < GRID_SIZE; c++) {
    if ((!skipRowCol || c !== col) && grid[row][c] === num) return false;
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    if ((!skipRowCol || r !== row) && grid[r][col] === num) return false;
  }
  const { br, bc } = boxIndex(row, col);
  const r0 = br * BOX_ROWS;
  const c0 = bc * BOX_COLS;
  for (let r = r0; r < r0 + BOX_ROWS; r++) {
    for (let c = c0; c < c0 + BOX_COLS; c++) {
      if ((!skipRowCol || r !== row || c !== col) && grid[r][c] === num) return false;
    }
  }
  return true;
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function solveGrid(grid: number[][], rand: () => number): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] !== 0) continue;
      for (const num of shuffle([...DIGITS], rand)) {
        if (isValidPlacement(grid, row, col, num)) {
          grid[row][col] = num;
          if (solveGrid(grid, rand)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function generateSolution(seed: string): number[][] {
  const rand = createSeededRandom(`${seed}-solution`);
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  solveGrid(grid, rand);
  return grid;
}

export function makePuzzle(solution: number[][], seed: string, givens = 16): {
  puzzle: number[][];
  givensMask: boolean[][];
} {
  const rand = createSeededRandom(`${seed}-holes`);
  const puzzle = cloneGrid(solution);
  const cells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) cells.push([r, c]);
  }
  shuffle(cells, rand);
  const toRemove = GRID_SIZE * GRID_SIZE - givens;
  for (let i = 0; i < toRemove; i++) {
    const [r, c] = cells[i];
    puzzle[r][c] = 0;
  }
  const givensMask = puzzle.map((row, r) =>
    row.map((val, c) => val !== 0),
  );
  return { puzzle, givensMask };
}

export function getConflicts(grid: number[][]): boolean[][] {
  const conflicts = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false),
  );
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const n = grid[r][c];
      if (n === 0) continue;
      if (!isValidPlacement(grid, r, c, n, true)) {
        conflicts[r][c] = true;
      }
    }
  }
  return conflicts;
}

export function isPuzzleComplete(grid: number[][], solution: number[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function isRowComplete(grid: number[][], solution: number[][], row: number): boolean {
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[row][c] !== solution[row][c]) return false;
  }
  return true;
}

export function isBoxComplete(
  grid: number[][],
  solution: number[][],
  boxRow: number,
  boxCol: number,
): boolean {
  const r0 = boxRow * BOX_ROWS;
  const c0 = boxCol * BOX_COLS;
  for (let r = r0; r < r0 + BOX_ROWS; r++) {
    for (let c = c0; c < c0 + BOX_COLS; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function dailySeed(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
