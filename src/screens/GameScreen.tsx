import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { playSound } from '../audio/soundManager';
import { SudokuGrid } from '../components/SudokuGrid';
import {
  dailySeed,
  generateSolution,
  GRID_SIZE,
  isBoxComplete,
  isPuzzleComplete,
  isRowComplete,
  isValidPlacement,
  makePuzzle,
} from '../game/sudoku';
import { palette } from '../theme/colors';

type Props = {
  onWin: (sessionSeconds: number) => void;
  onBack: () => void;
};

function emptyNotes(): number[][][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => [] as number[]),
  );
}

function cloneGrid(g: number[][]): number[][] {
  return g.map((r) => [...r]);
}

export function GameScreen({ onWin, onBack }: Props) {
  const seed = dailySeed();
  const { solution, puzzle, givensMask } = useMemo(() => {
    const sol = generateSolution(seed);
    const { puzzle: p, givensMask: mask } = makePuzzle(sol, seed, 17);
    return { solution: sol, puzzle: p, givensMask: mask };
  }, [seed]);

  const [grid, setGrid] = useState(() => cloneGrid(puzzle));
  const [notes, setNotes] = useState(emptyNotes);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const startedAt = useRef(Date.now());
  const completedRows = useRef(new Set<number>());
  const completedBoxes = useRef(new Set<string>());

  const sessionSeconds = () => Math.floor((Date.now() - startedAt.current) / 1000);

  const tryWin = useCallback(
    (next: number[][]) => {
      if (isPuzzleComplete(next, solution)) {
        void playSound('win');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onWin(sessionSeconds());
      }
    },
    [onWin, solution],
  );

  const checkUnitComplete = useCallback(
    (next: number[][], row: number, col: number) => {
      if (isRowComplete(next, solution, row) && !completedRows.current.has(row)) {
        completedRows.current.add(row);
        void playSound('complete');
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const br = Math.floor(row / 2);
      const bc = Math.floor(col / 3);
      const key = `${br}-${bc}`;
      if (isBoxComplete(next, solution, br, bc) && !completedBoxes.current.has(key)) {
        completedBoxes.current.add(key);
        void playSound('complete');
      }
    },
    [solution],
  );

  const placeDigit = useCallback(
    (digit: number) => {
      if (!selected) return;
      const { row, col } = selected;
      if (givensMask[row][col]) return;

      if (noteMode) {
        setNotes((prev) => {
          const copy = prev.map((r) => r.map((c) => [...c]));
          const list = copy[row][col];
          const idx = list.indexOf(digit);
          if (idx >= 0) list.splice(idx, 1);
          else list.push(digit);
          list.sort((a, b) => a - b);
          return copy;
        });
        return;
      }

      setGrid((prev) => {
        const next = cloneGrid(prev);
        if (digit === 0) {
          next[row][col] = 0;
          void playSound('erase');
          return next;
        }
        next[row][col] = digit;
        if (isValidPlacement(next, row, col, digit)) {
          void playSound('place');
          void Haptics.selectionAsync();
          setNotes((n) => {
            const copy = n.map((r) => r.map((c) => [...c]));
            copy[row][col] = [];
            return copy;
          });
          checkUnitComplete(next, row, col);
          tryWin(next);
        } else {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return next;
      });
    },
    [selected, givensMask, noteMode, checkUnitComplete, tryWin],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>← Home</Text>
          </Pressable>
          <Text style={styles.heading}>Daily 6×6</Text>
          <Pressable
            onPress={() => setNoteMode((n) => !n)}
            style={[styles.noteToggle, noteMode && styles.noteToggleOn]}
          >
            <Text style={[styles.noteToggleText, noteMode && styles.noteToggleTextOn]}>
              Notes
            </Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          {noteMode
            ? 'Pencil mode — tap numbers to mark possibilities'
            : 'Tap a cell, then a number. Conflicts glow softly.'}
        </Text>

        <SudokuGrid
          grid={grid}
          givensMask={givensMask}
          notes={notes}
          selected={selected}
          onSelect={(row, col) => setSelected({ row, col })}
        />

        <View style={styles.pad}>
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <Pressable key={d} style={styles.padKey} onPress={() => placeDigit(d)}>
              <Text style={styles.padDigit}>{d}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.padKey, styles.eraseKey]} onPress={() => placeDigit(0)}>
            <Text style={styles.eraseText}>Erase</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  back: {
    color: palette.lavenderDeep,
    fontSize: 16,
    fontWeight: '500',
  },
  heading: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.ink,
  },
  noteToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.lavender,
    backgroundColor: palette.white,
  },
  noteToggleOn: {
    backgroundColor: palette.sage,
    borderColor: palette.sageDeep,
  },
  noteToggleText: {
    fontSize: 13,
    color: palette.inkSoft,
    fontWeight: '600',
  },
  noteToggleTextOn: {
    color: palette.ink,
  },
  hint: {
    fontSize: 13,
    color: palette.inkSoft,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    maxWidth: 320,
  },
  padKey: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padDigit: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.lavenderDeep,
  },
  eraseKey: {
    width: 114,
    backgroundColor: palette.lavender,
  },
  eraseText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
});
