import { useCallback, useMemo, useRef, useState } from 'react';
import { nextAffirmation } from './affirmations';
import {
  boxIndex,
  cloneGrid,
  findConflicts,
  generatePuzzle,
  gridComplete,
  isBoxComplete,
  isColComplete,
  isRowComplete,
  type Grid,
  type Puzzle,
} from './sudoku/logic';

export type SudokuPhase = 'playing' | 'won';

export type AffirmationEvent = {
  id: number;
  word: string;
};

export type SudokuGameState = {
  phase: SudokuPhase;
  grid: Grid;
  givens: boolean[][];
  solution: Grid;
  selected: { row: number; col: number } | null;
  conflicts: boolean[][];
  hintUsed: boolean;
  startedAt: number;
  affirmation: AffirmationEvent | null;
};

function freshPuzzle(): Puzzle {
  return generatePuzzle(24);
}

export function useSudokuGame() {
  const initial = freshPuzzle();
  const [state, setState] = useState<SudokuGameState>(() => ({
    phase: 'playing',
    grid: cloneGrid(initial.puzzle),
    givens: initial.givens.map((row) => [...row]),
    solution: cloneGrid(initial.solution),
    selected: null,
    conflicts: findConflicts(initial.puzzle),
    hintUsed: false,
    startedAt: Date.now(),
    affirmation: null,
  }));

  const completedRows = useRef(new Set<number>());
  const completedCols = useRef(new Set<number>());
  const completedBoxes = useRef(new Set<string>());
  const affirmationId = useRef(0);

  const bumpAffirmation = (): AffirmationEvent => {
    affirmationId.current += 1;
    return { id: affirmationId.current, word: nextAffirmation() };
  };

  const clearAffirmation = useCallback(() => {
    setState((s) => ({ ...s, affirmation: null }));
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    setState((s) => {
      if (s.phase !== 'playing' || s.givens[row][col]) return s;
      return { ...s, selected: { row, col } };
    });
  }, []);

  const placeValue = useCallback((value: number) => {
    setState((s) => {
      if (s.phase !== 'playing' || !s.selected) return s;
      const { row, col } = s.selected;
      if (s.givens[row][col]) return s;

      const grid = cloneGrid(s.grid);
      grid[row][col] = value;
      const conflicts = findConflicts(grid);
      const hasConflict = conflicts[row][col];
      const phase: SudokuPhase = gridComplete(grid) ? 'won' : s.phase;

      let affirmation: AffirmationEvent | null = null;

      if (!hasConflict && value !== 0) {
        if (phase === 'won') {
          affirmation = bumpAffirmation();
        } else if (isRowComplete(grid, row) && !completedRows.current.has(row)) {
          completedRows.current.add(row);
          affirmation = bumpAffirmation();
        } else if (isColComplete(grid, col) && !completedCols.current.has(col)) {
          completedCols.current.add(col);
          affirmation = bumpAffirmation();
        } else {
          const { br, bc } = boxIndex(row, col);
          const key = `${br},${bc}`;
          if (isBoxComplete(grid, br, bc) && !completedBoxes.current.has(key)) {
            completedBoxes.current.add(key);
            affirmation = bumpAffirmation();
          } else {
            affirmation = bumpAffirmation();
          }
        }
      }

      return {
        ...s,
        grid,
        conflicts,
        phase,
        affirmation: affirmation ?? s.affirmation,
      };
    });
  }, []);

  const clearCell = useCallback(() => {
    placeValue(0);
  }, [placeValue]);

  const applyHint = useCallback(() => {
    setState((s) => {
      if (s.hintUsed || s.phase !== 'playing') return s;
      const empty: { row: number; col: number }[] = [];
      for (let r = 0; r < s.grid.length; r += 1) {
        for (let c = 0; c < s.grid[r].length; c += 1) {
          if (!s.givens[r][c] && s.grid[r][c] === 0) empty.push({ row: r, col: c });
        }
      }
      if (empty.length === 0) return s;
      const pick = empty[Math.floor(Math.random() * empty.length)];
      const grid = cloneGrid(s.grid);
      grid[pick.row][pick.col] = s.solution[pick.row][pick.col];
      const conflicts = findConflicts(grid);
      const phase: SudokuPhase = gridComplete(grid) ? 'won' : s.phase;
      return {
        ...s,
        grid,
        conflicts,
        hintUsed: true,
        selected: pick,
        phase,
        affirmation: phase === 'won' ? bumpAffirmation() : s.affirmation,
      };
    });
  }, []);

  const resetRun = useCallback(() => {
    const p = freshPuzzle();
    completedRows.current = new Set();
    completedCols.current = new Set();
    completedBoxes.current = new Set();
    setState({
      phase: 'playing',
      grid: cloneGrid(p.puzzle),
      givens: p.givens.map((row) => [...row]),
      solution: cloneGrid(p.solution),
      selected: null,
      conflicts: findConflicts(p.puzzle),
      hintUsed: false,
      startedAt: Date.now(),
      affirmation: null,
    });
  }, []);

  const sessionSeconds = useCallback(() => {
    return Math.floor((Date.now() - state.startedAt) / 1000);
  }, [state.startedAt]);

  const elapsedMs = useMemo(() => Date.now() - state.startedAt, [state.startedAt, state.phase]);

  return {
    state,
    selectCell,
    placeValue,
    clearCell,
    applyHint,
    resetRun,
    sessionSeconds,
    elapsedMs,
    clearAffirmation,
  };
}
