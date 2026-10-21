/// <reference types="jest" />
import {
  areAdjacent,
  Board,
  dailySeed,
  emptyBoard,
  generatePuzzle,
  getConflicts,
  hasUniqueSolution,
  isSolved,
  isValidPlacement,
  nextMark,
  regionCount,
  Regions,
  solve,
  tokensOf,
} from '../queens';

const REGIONS_5: Regions = [
  [0, 0, 1, 1, 1],
  [0, 2, 2, 1, 1],
  [3, 2, 2, 2, 1],
  [3, 3, 4, 4, 4],
  [3, 3, 4, 4, 4],
];

function boardFrom(size: number, tokens: [number, number][]): Board {
  const b = emptyBoard(size);
  for (const [r, c] of tokens) b[r][c] = 'token';
  return b;
}

function regionsConnected(regions: Regions): boolean {
  const size = regions.length;
  for (const id of new Set(regions.flat())) {
    const cells = regions.flatMap((row, r) => row.flatMap((v, c) => (v === id ? [[r, c]] : [])));
    const seen = new Set([cells[0].join()]);
    const stack = [cells[0]];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue;
        if (regions[nr][nc] !== id || seen.has(`${nr},${nc}`)) continue;
        seen.add(`${nr},${nc}`);
        stack.push([nr, nc]);
      }
    }
    if (seen.size !== cells.length) return false;
  }
  return true;
}

const seeds = Array.from({ length: 60 }, (_, i) => dailySeed(new Date(2026, 0, 1 + i)));

describe('marks', () => {
  it('cycles empty → cross → token → empty', () => {
    expect(nextMark('empty')).toBe('cross');
    expect(nextMark('cross')).toBe('token');
    expect(nextMark('token')).toBe('empty');
  });

  it('ignores crosses when collecting tokens', () => {
    const b = boardFrom(5, [[0, 0]]);
    b[1][1] = 'cross';
    expect(tokensOf(b)).toEqual([{ row: 0, col: 0 }]);
  });
});

describe('adjacency', () => {
  it('treats all eight neighbours as touching, but not the cell itself or cells two apart', () => {
    const center = { row: 2, col: 2 };
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const other = { row: 2 + dr, col: 2 + dc };
        expect(areAdjacent(center, other)).toBe(dr !== 0 || dc !== 0);
      }
    }
    expect(areAdjacent(center, { row: 4, col: 3 })).toBe(false);
    expect(areAdjacent(center, { row: 0, col: 2 })).toBe(false);
  });

  it('rejects a diagonal neighbour even in a different row, column, and region', () => {
    const b = boardFrom(5, [[1, 1]]);
    expect(REGIONS_5[1][1]).not.toBe(REGIONS_5[2][0]);
    expect(isValidPlacement(b, REGIONS_5, { row: 2, col: 0 })).toBe(false);
    expect(getConflicts(boardFrom(5, [[1, 1], [2, 0]]), REGIONS_5)[2][0]).toBe(true);
  });
});

describe('placement validation', () => {
  const b = boardFrom(5, [[0, 0]]);

  it('rejects a second token in the same row, column, or region', () => {
    expect(isValidPlacement(b, REGIONS_5, { row: 0, col: 4 })).toBe(false);
    expect(isValidPlacement(b, REGIONS_5, { row: 4, col: 0 })).toBe(false);
    const regionOnly = boardFrom(5, [[3, 0]]);
    expect(REGIONS_5[4][1]).toBe(REGIONS_5[3][0]);
    expect(isValidPlacement(regionOnly, REGIONS_5, { row: 4, col: 1 })).toBe(false);
  });

  it('accepts a token that breaks no rule and does not conflict with itself', () => {
    expect(isValidPlacement(b, REGIONS_5, { row: 2, col: 2 })).toBe(true);
    expect(isValidPlacement(b, REGIONS_5, { row: 0, col: 0 })).toBe(true);
  });

  it('flags both tokens of a conflicting pair and leaves others alone', () => {
    const conflicts = getConflicts(boardFrom(5, [[0, 0], [0, 3], [2, 2]]), REGIONS_5);
    expect(conflicts[0][0]).toBe(true);
    expect(conflicts[0][3]).toBe(true);
    expect(conflicts[2][2]).toBe(false);
  });
});

describe('win detection', () => {
  const solutions = solve(REGIONS_5, 10);

  it('accepts a board that satisfies every rule', () => {
    expect(solutions.length).toBeGreaterThan(0);
    const b = boardFrom(5, solutions[0].map((c, r) => [r, c] as [number, number]));
    b[0][solutions[0][0] === 0 ? 1 : 0] = 'cross';
    expect(isSolved(b, REGIONS_5)).toBe(true);
  });

  it('accepts any rule-valid board, not one stored answer', () => {
    // Every solver-found layout is a win, whichever one the player finds.
    for (const s of solutions) {
      expect(isSolved(boardFrom(5, s.map((c, r) => [r, c] as [number, number])), REGIONS_5)).toBe(
        true,
      );
    }
  });

  it('rejects too few tokens, rule breaks, and touching tokens', () => {
    const s = solutions[0];
    const partial = boardFrom(5, s.slice(0, 4).map((c, r) => [r, c] as [number, number]));
    expect(isSolved(partial, REGIONS_5)).toBe(false);

    // One per row and column, but tokens touch diagonally.
    const diagonal = boardFrom(5, [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]]);
    expect(isSolved(diagonal, REGIONS_5)).toBe(false);

    // Non-touching, one per row/column, but region 0 is empty and region 1 has two.
    const sameRegion = boardFrom(5, [[0, 2], [1, 4], [2, 1], [3, 3], [4, 0]]);
    expect(tokensOf(sameRegion)).toHaveLength(5);
    expect(isSolved(sameRegion, REGIONS_5)).toBe(false);
  });
});

describe('solver', () => {
  it('finds no solution when a layout is impossible and many when unconstrained', () => {
    const oneRegion: Regions = Array.from({ length: 5 }, () => Array(5).fill(0));
    expect(solve(oneRegion, 2)).toHaveLength(0);
    const byRow: Regions = Array.from({ length: 5 }, (_, r) => Array(5).fill(r));
    expect(solve(byRow, 2)).toHaveLength(2);
    expect(hasUniqueSolution(byRow)).toBe(false);
  });
});

describe('daily puzzle generation', () => {
  it.each(seeds)('6×6 puzzle %s has exactly one solution, matching its answer', (seed) => {
    const p = generatePuzzle(seed, 6);
    expect(p.regions).toHaveLength(6);
    expect(regionCount(p.regions)).toBe(6);
    expect(regionsConnected(p.regions)).toBe(true);
    const all = solve(p.regions, 2);
    expect(all).toEqual([p.solution]);
    const solved = boardFrom(6, p.solution.map((c, r) => [r, c] as [number, number]));
    expect(isSolved(solved, p.regions)).toBe(true);
  });

  it.each([7, 8])('%i×%i puzzles are also uniquely solvable', (size) => {
    for (const seed of seeds.slice(0, 10)) {
      const p = generatePuzzle(seed, size);
      expect(regionCount(p.regions)).toBe(size);
      expect(regionsConnected(p.regions)).toBe(true);
      expect(hasUniqueSolution(p.regions)).toBe(true);
    }
  });

  it('is deterministic per date and varies across dates', () => {
    expect(generatePuzzle('2026-10-21')).toEqual(generatePuzzle('2026-10-21'));
    expect(generatePuzzle('2026-10-21').regions).not.toEqual(generatePuzzle('2026-10-22').regions);
  });
});
