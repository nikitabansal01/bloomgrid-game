import { BOX_HEIGHT, BOX_WIDTH, SUDOKU_SIZE } from '../../theme';

export type Grid = number[][];

export function createEmptyGrid(): Grid {
  return Array.from({ length: SUDOKU_SIZE }, () => Array(SUDOKU_SIZE).fill(0));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function boxStart(row: number, col: number): { r: number; c: number } {
  const r = Math.floor(row / BOX_HEIGHT) * BOX_HEIGHT;
  const c = Math.floor(col / BOX_WIDTH) * BOX_WIDTH;
  return { r, c };
}

export function isValidPlacement(grid: Grid, row: number, col: number, value: number): boolean {
  if (value < 1 || value > SUDOKU_SIZE) return false;
  for (let c = 0; c < SUDOKU_SIZE; c += 1) {
    if (c !== col && grid[row][c] === value) return false;
  }
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    if (r !== row && grid[r][col] === value) return false;
  }
  const { r: br, c: bc } = boxStart(row, col);
  for (let r = br; r < br + BOX_HEIGHT; r += 1) {
    for (let c = bc; c < bc + BOX_WIDTH; c += 1) {
      if ((r !== row || c !== col) && grid[r][c] === value) return false;
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillGrid(grid: Grid, row: number, col: number): boolean {
  if (row >= SUDOKU_SIZE) return true;
  const nextRow = col === SUDOKU_SIZE - 1 ? row + 1 : row;
  const nextCol = col === SUDOKU_SIZE - 1 ? 0 : col + 1;
  if (grid[row][col] !== 0) return fillGrid(grid, nextRow, nextCol);

  for (const num of shuffle([1, 2, 3, 4, 5, 6])) {
    if (!isValidPlacement(grid, row, col, num)) continue;
    grid[row][col] = num;
    if (fillGrid(grid, nextRow, nextCol)) return true;
    grid[row][col] = 0;
  }
  return false;
}

export function generateSolution(): Grid {
  const grid = createEmptyGrid();
  fillGrid(grid, 0, 0);
  return grid;
}

function countSolutions(grid: Grid, limit: number): number {
  let solutions = 0;

  function solve(g: Grid, row: number, col: number): void {
    if (solutions >= limit) return;
    if (row >= SUDOKU_SIZE) {
      solutions += 1;
      return;
    }
    const nextRow = col === SUDOKU_SIZE - 1 ? row + 1 : row;
    const nextCol = col === SUDOKU_SIZE - 1 ? 0 : col + 1;
    if (g[row][col] !== 0) {
      solve(g, nextRow, nextCol);
      return;
    }
    for (let n = 1; n <= SUDOKU_SIZE; n += 1) {
      if (!isValidPlacement(g, row, col, n)) continue;
      g[row][col] = n;
      solve(g, nextRow, nextCol);
      g[row][col] = 0;
      if (solutions >= limit) return;
    }
  }

  solve(cloneGrid(grid), 0, 0);
  return solutions;
}

export type Puzzle = {
  puzzle: Grid;
  solution: Grid;
  givens: boolean[][];
};

/** Medium 6×6 puzzle: ~22–26 givens for quick mobile sessions. */
export function generatePuzzle(targetGivens = 24): Puzzle {
  const solution = generateSolution();
  const puzzle = cloneGrid(solution);
  const givens = puzzle.map((row) => row.map(() => true));

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    for (let c = 0; c < SUDOKU_SIZE; c += 1) {
      cells.push({ r, c });
    }
  }

  let remaining = SUDOKU_SIZE * SUDOKU_SIZE;
  for (const { r, c } of shuffle(cells)) {
    if (remaining <= targetGivens) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    givens[r][c] = false;
    remaining -= 1;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = backup;
      givens[r][c] = true;
      remaining += 1;
    }
  }

  return { puzzle, solution, givens };
}

export function gridComplete(grid: Grid): boolean {
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    for (let c = 0; c < SUDOKU_SIZE; c += 1) {
      const v = grid[r][c];
      if (v === 0 || !isValidPlacement(grid, r, c, v)) return false;
    }
  }
  return true;
}

export function findConflicts(grid: Grid): boolean[][] {
  const conflicts = grid.map((row) => row.map(() => false));
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    for (let c = 0; c < SUDOKU_SIZE; c += 1) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (!isValidPlacement(grid, r, c, v)) conflicts[r][c] = true;
    }
  }
  return conflicts;
}

export function isRowComplete(grid: Grid, row: number): boolean {
  const seen = new Set<number>();
  for (let c = 0; c < SUDOKU_SIZE; c += 1) {
    const v = grid[row][c];
    if (v === 0 || seen.has(v)) return false;
    seen.add(v);
  }
  return seen.size === SUDOKU_SIZE;
}

export function isColComplete(grid: Grid, col: number): boolean {
  const seen = new Set<number>();
  for (let r = 0; r < SUDOKU_SIZE; r += 1) {
    const v = grid[r][col];
    if (v === 0 || seen.has(v)) return false;
    seen.add(v);
  }
  return seen.size === SUDOKU_SIZE;
}

export function isBoxComplete(grid: Grid, boxRow: number, boxCol: number): boolean {
  const seen = new Set<number>();
  const br = boxRow * BOX_HEIGHT;
  const bc = boxCol * BOX_WIDTH;
  for (let r = br; r < br + BOX_HEIGHT; r += 1) {
    for (let c = bc; c < bc + BOX_WIDTH; c += 1) {
      const v = grid[r][c];
      if (v === 0 || seen.has(v)) return false;
      seen.add(v);
    }
  }
  return seen.size === SUDOKU_SIZE;
}

export function boxIndex(row: number, col: number): { br: number; bc: number } {
  const { r, c } = boxStart(row, col);
  return { br: r / BOX_HEIGHT, bc: c / BOX_WIDTH };
}
