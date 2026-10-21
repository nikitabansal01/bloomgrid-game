/**
 * Queens-style placement puzzle: an N×N board split into N colored regions.
 * A solved board has exactly one token in every row, column, and region, and no
 * two tokens touch (including diagonally).
 */

export type Mark = 'empty' | 'cross' | 'token';
export type Board = Mark[][];
export type Regions = number[][];
export type Cell = { row: number; col: number };

export type Puzzle = {
  size: number;
  regions: Regions;
  /** The unique solution as the token column for each row. Not shown to the player. */
  solution: number[];
};

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

function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dailySeed(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function emptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array<Mark>(size).fill('empty'));
}

/** Tap cycle: empty → cross → token → empty. */
export function nextMark(mark: Mark): Mark {
  if (mark === 'empty') return 'cross';
  if (mark === 'cross') return 'token';
  return 'empty';
}

export function tokensOf(board: Board): Cell[] {
  const cells: Cell[] = [];
  board.forEach((row, r) =>
    row.forEach((m, c) => {
      if (m === 'token') cells.push({ row: r, col: c });
    }),
  );
  return cells;
}

export function areAdjacent(a: Cell, b: Cell): boolean {
  return (
    (a.row !== b.row || a.col !== b.col) &&
    Math.abs(a.row - b.row) <= 1 &&
    Math.abs(a.col - b.col) <= 1
  );
}

/** Whether two tokens break a rule together: same row, column, or region, or touching. */
export function tokensConflict(a: Cell, b: Cell, regions: Regions): boolean {
  if (a.row === b.row && a.col === b.col) return false;
  return (
    a.row === b.row ||
    a.col === b.col ||
    regions[a.row][a.col] === regions[b.row][b.col] ||
    areAdjacent(a, b)
  );
}

/** Whether a token at `cell` would break a rule against the tokens already on `board`. */
export function isValidPlacement(board: Board, regions: Regions, cell: Cell): boolean {
  return tokensOf(board).every((t) => !tokensConflict(cell, t, regions));
}

/** Marks every token that breaks a rule with at least one other token. */
export function getConflicts(board: Board, regions: Regions): boolean[][] {
  const size = board.length;
  const conflicts = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const tokens = tokensOf(board);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      if (tokensConflict(tokens[i], tokens[j], regions)) {
        conflicts[tokens[i].row][tokens[i].col] = true;
        conflicts[tokens[j].row][tokens[j].col] = true;
      }
    }
  }
  return conflicts;
}

/** Solved when there are exactly N tokens and no pair breaks a rule (so every row, column, and region has one). */
export function isSolved(board: Board, regions: Regions): boolean {
  const tokens = tokensOf(board);
  if (tokens.length !== board.length) return false;
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      if (tokensConflict(tokens[i], tokens[j], regions)) return false;
    }
  }
  return true;
}

export function regionCount(regions: Regions): number {
  return new Set(regions.flat()).size;
}

/**
 * Counts solutions (as token-column-per-row arrays), stopping at `limit`.
 * Rows are filled top to bottom, so adjacency only needs checking against the previous row.
 */
export function solve(regions: Regions, limit = 2): number[][] {
  const size = regions.length;
  const usedCols = new Array<boolean>(size).fill(false);
  const usedRegions = new Array<boolean>(regionCount(regions)).fill(false);
  const cols: number[] = [];
  const found: number[][] = [];

  const place = (row: number): boolean => {
    if (row === size) {
      found.push([...cols]);
      return found.length >= limit;
    }
    for (let col = 0; col < size; col++) {
      const region = regions[row][col];
      if (usedCols[col] || usedRegions[region]) continue;
      if (row > 0 && Math.abs(cols[row - 1] - col) <= 1) continue;
      usedCols[col] = usedRegions[region] = true;
      cols.push(col);
      if (place(row + 1)) return true;
      cols.pop();
      usedCols[col] = usedRegions[region] = false;
    }
    return false;
  };
  place(0);
  return found;
}

export function hasUniqueSolution(regions: Regions): boolean {
  return solve(regions, 2).length === 1;
}

function randomTokenLayout(size: number, rand: () => number): number[] | null {
  const cols: number[] = [];
  const used = new Array<boolean>(size).fill(false);
  const place = (row: number): boolean => {
    if (row === size) return true;
    for (const col of shuffle(Array.from({ length: size }, (_, i) => i), rand)) {
      if (used[col] || (row > 0 && Math.abs(cols[row - 1] - col) <= 1)) continue;
      used[col] = true;
      cols.push(col);
      if (place(row + 1)) return true;
      cols.pop();
      used[col] = false;
    }
    return false;
  };
  return place(0) ? cols : null;
}

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

/** Grows one connected region around each token by random flood fill. */
function growRegions(size: number, tokenCols: number[], rand: () => number): Regions {
  const regions = Array.from({ length: size }, () => Array<number>(size).fill(-1));
  const frontiers: [number, number][][] = tokenCols.map((col, row) => {
    regions[row][col] = row;
    return [[row, col]];
  });
  let unassigned = size * size - size;
  while (unassigned > 0) {
    const id = Math.floor(rand() * size);
    const frontier = frontiers[id];
    if (frontier.length === 0) continue;
    const idx = Math.floor(rand() * frontier.length);
    const [r, c] = frontier[idx];
    const open = NEIGHBORS.map(([dr, dc]) => [r + dr, c + dc] as [number, number]).filter(
      ([nr, nc]) => nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1,
    );
    if (open.length === 0) {
      frontier.splice(idx, 1);
      continue;
    }
    const [nr, nc] = open[Math.floor(rand() * open.length)];
    regions[nr][nc] = id;
    frontier.push([nr, nc]);
    unassigned--;
  }
  return regions;
}

function isConnected(regions: Regions, id: number): boolean {
  const size = regions.length;
  const cells: [number, number][] = [];
  regions.forEach((row, r) => row.forEach((v, c) => v === id && cells.push([r, c])));
  if (cells.length === 0) return false;
  const seen = new Set([`${cells[0][0]},${cells[0][1]}`]);
  const stack = [cells[0]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [dr, dc] of NEIGHBORS) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (regions[nr][nc] !== id || seen.has(key)) continue;
      seen.add(key);
      stack.push([nr, nc]);
    }
  }
  return seen.size === cells.length;
}

const SOLUTION_SAMPLE = 64;
const MAX_REPAIR_STEPS = 400;

/**
 * Breaks alternative solutions one at a time: moves a cell used by an alternative
 * (never one of the intended tokens) into a neighboring region, keeping regions
 * connected and never increasing the number of solutions.
 */
function repairToUnique(regions: Regions, tokenCols: number[], rand: () => number): boolean {
  const size = regions.length;
  let solutions = solve(regions, SOLUTION_SAMPLE);
  for (let step = 0; step < MAX_REPAIR_STEPS && solutions.length > 1; step++) {
    const alt = solutions.find((s) => s.some((c, r) => c !== tokenCols[r]));
    if (!alt) return false;
    const candidates = shuffle(
      alt.map((col, row) => [row, col] as [number, number]).filter(([r, c]) => tokenCols[r] !== c),
      rand,
    );
    let changed = false;
    for (const [r, c] of candidates) {
      const from = regions[r][c];
      const targets = shuffle(
        NEIGHBORS.map(([dr, dc]) => [r + dr, c + dc])
          .filter(([nr, nc]) => nr >= 0 && nr < size && nc >= 0 && nc < size)
          .map(([nr, nc]) => regions[nr][nc])
          .filter((id) => id !== from),
        rand,
      );
      for (const to of targets) {
        regions[r][c] = to;
        if (isConnected(regions, from)) {
          const next = solve(regions, SOLUTION_SAMPLE);
          if (next.length <= solutions.length) {
            solutions = next;
            changed = true;
            break;
          }
        }
        regions[r][c] = from;
      }
      if (changed) break;
    }
    if (!changed) return false;
  }
  return solutions.length === 1;
}

/** Deterministic puzzle for `seed`; the solver confirms the regions admit exactly one solution. */
export function generatePuzzle(seed: string, size = 6): Puzzle {
  const rand = createSeededRandom(`${seed}-queens-${size}`);
  for (;;) {
    const tokenCols = randomTokenLayout(size, rand);
    if (!tokenCols) continue;
    const regions = growRegions(size, tokenCols, rand);
    if (repairToUnique(regions, tokenCols, rand)) {
      return { size, regions, solution: tokenCols };
    }
  }
}
