/// <reference types="jest" />
import {
  countSolutions,
  dailySeed,
  generateSolution,
  GRID_SIZE,
  hasUniqueSolution,
  isBoxComplete,
  isPuzzleComplete,
  isRowComplete,
  isValidPlacement,
  makePuzzle,
} from '../sudoku';

const clone = (g: number[][]) => g.map((r) => [...r]);

function isValidSolvedGrid(g: number[][]): boolean {
  const ok = (cells: number[]) => [...cells].sort().join('') === '123456';
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!ok(g[i])) return false;
    if (!ok(g.map((r) => r[i]))) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const box: number[] = [];
      for (let r = br * 2; r < br * 2 + 2; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) box.push(g[r][c]);
      }
      if (!ok(box)) return false;
    }
  }
  return true;
}

const seeds = Array.from({ length: 40 }, (_, i) => dailySeed(new Date(2026, 0, 1 + i)));

describe('isValidPlacement', () => {
  const solution = generateSolution('2026-10-21');

  it('accepts a correct digit already written into its own cell when skipping that cell', () => {
    const grid = clone(solution);
    const [row, col] = [2, 4];
    expect(isValidPlacement(grid, row, col, grid[row][col], true)).toBe(true);
  });

  it('treats a written digit as conflicting with itself when not skipping the cell', () => {
    const grid = clone(solution);
    expect(isValidPlacement(grid, 0, 0, grid[0][0])).toBe(false);
  });

  it('rejects duplicates in the same row, column, and box', () => {
    const empty = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

    const rowCase = clone(empty);
    rowCase[0][5] = 3;
    rowCase[0][0] = 3;
    expect(isValidPlacement(rowCase, 0, 0, 3, true)).toBe(false);

    const colCase = clone(empty);
    colCase[5][0] = 4;
    colCase[0][0] = 4;
    expect(isValidPlacement(colCase, 0, 0, 4, true)).toBe(false);

    const boxCase = clone(empty);
    boxCase[1][2] = 5;
    boxCase[0][0] = 5;
    expect(isValidPlacement(boxCase, 0, 0, 5, true)).toBe(false);

    const fine = clone(empty);
    fine[2][3] = 5;
    fine[0][0] = 5;
    expect(isValidPlacement(fine, 0, 0, 5, true)).toBe(true);
  });

  it('always allows erasing', () => {
    expect(isValidPlacement(clone(solution), 0, 0, 0)).toBe(true);
  });
});

describe('win and unit completion', () => {
  const solution = generateSolution('2026-10-21');

  it('detects a completed solution', () => {
    expect(isPuzzleComplete(solution)).toBe(true);
  });

  it('accepts any valid completed grid, not just the stored answer', () => {
    // Relabelling digits preserves sudoku validity but produces a different grid.
    const relabelled = solution.map((r) => r.map((v) => (v % GRID_SIZE) + 1));
    expect(relabelled).not.toEqual(solution);
    expect(isPuzzleComplete(relabelled)).toBe(true);
  });

  it('rejects grids with blanks or duplicates', () => {
    const blank = clone(solution);
    blank[3][3] = 0;
    expect(isPuzzleComplete(blank)).toBe(false);

    const dup = clone(solution);
    dup[0][0] = dup[0][1];
    expect(isPuzzleComplete(dup)).toBe(false);
  });

  it('reports row and box completion only when filled without conflicts', () => {
    const grid = clone(solution);
    expect(isRowComplete(grid, 0)).toBe(true);
    expect(isBoxComplete(grid, 0, 0)).toBe(true);

    grid[0][1] = 0;
    expect(isRowComplete(grid, 0)).toBe(false);
    expect(isBoxComplete(grid, 0, 0)).toBe(false);
    expect(isRowComplete(grid, 1)).toBe(true);
    expect(isBoxComplete(grid, 0, 1)).toBe(true);
  });

  it('wins when a player fills every blank of a generated puzzle', () => {
    const { puzzle } = makePuzzle(solution, '2026-10-21', 17);
    const grid = clone(puzzle);
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] !== 0) continue;
        expect(isPuzzleComplete(grid)).toBe(false);
        grid[r][c] = solution[r][c];
        expect(isValidPlacement(grid, r, c, grid[r][c], true)).toBe(true);
      }
    }
    expect(isPuzzleComplete(grid)).toBe(true);
  });
});

describe('puzzle generation', () => {
  it('produces valid solutions', () => {
    for (const seed of seeds) expect(isValidSolvedGrid(generateSolution(seed))).toBe(true);
  });

  it('counts multiple solutions for an under-constrained grid', () => {
    const empty = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    expect(countSolutions(empty, 2)).toBe(2);
    expect(hasUniqueSolution(empty)).toBe(false);
  });

  it.each(seeds)('daily puzzle %s has exactly one solution matching the answer', (seed) => {
    const solution = generateSolution(seed);
    const { puzzle, givensMask } = makePuzzle(solution, seed, 17);
    expect(hasUniqueSolution(puzzle)).toBe(true);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        expect(givensMask[r][c]).toBe(puzzle[r][c] !== 0);
        if (puzzle[r][c] !== 0) expect(puzzle[r][c]).toBe(solution[r][c]);
      }
    }
    const givens = puzzle.flat().filter((v) => v !== 0).length;
    expect(givens).toBeGreaterThanOrEqual(17);
    expect(givens).toBeLessThanOrEqual(22);
  });

  it('spreads blanks across the grid instead of the first cells in reading order', () => {
    for (const seed of seeds) {
      const { puzzle } = makePuzzle(generateSolution(seed), seed, 17);
      const blanks = puzzle.flat().map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
      const readingOrderPrefix = Array.from({ length: blanks.length }, (_, i) => i);
      expect(blanks).not.toEqual(readingOrderPrefix);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = makePuzzle(generateSolution('2026-10-21'), '2026-10-21', 17);
    const b = makePuzzle(generateSolution('2026-10-21'), '2026-10-21', 17);
    expect(a).toEqual(b);
  });
});
