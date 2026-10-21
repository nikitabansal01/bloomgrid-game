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
import { BOARD_WIDTH, SudokuGrid } from '../components/SudokuGrid';
import {
  BOX_COLS,
  BOX_ROWS,
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
  onWin: (sessionSeconds: number, puzzleDate: string) => void;
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
  // Fixed for the lifetime of this game so the puzzle can't change at midnight mid-play.
  const [seed] = useState(() => dailySeed());
  const { puzzle, givensMask } = useMemo(() => {
    const sol = generateSolution(seed);
    return makePuzzle(sol, seed, 17);
  }, [seed]);

  const [grid, setGrid] = useState(() => cloneGrid(puzzle));
  const [notes, setNotes] = useState(emptyNotes);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const startedAt = useRef(Date.now());
  const won = useRef(false);
  const completedRows = useRef(new Set<number>());
  const completedBoxes = useRef(new Set<string>());

  const sessionSeconds = () => Math.floor((Date.now() - startedAt.current) / 1000);

  const tryWin = useCallback(
    (next: number[][]) => {
      if (won.current || !isPuzzleComplete(next)) return;
      won.current = true;
      void playSound('win');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onWin(sessionSeconds(), seed);
    },
    [onWin, seed],
  );

  const checkUnitComplete = useCallback((next: number[][], row: number, col: number) => {
    if (isRowComplete(next, row) && !completedRows.current.has(row)) {
      completedRows.current.add(row);
      void playSound('complete');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const br = Math.floor(row / BOX_ROWS);
    const bc = Math.floor(col / BOX_COLS);
    const key = `${br}-${bc}`;
    if (isBoxComplete(next, br, bc) && !completedBoxes.current.has(key)) {
      completedBoxes.current.add(key);
      void playSound('complete');
    }
  }, []);

  const placeDigit = useCallback(
    (digit: number) => {
      if (!selected) return;
      const { row, col } = selected;
      if (givensMask[row][col]) return;

      if (noteMode) {
        if (digit === 0) {
          setNotes((prev) => {
            const copy = prev.map((r) => r.map((c) => [...c]));
            copy[row][col] = [];
            return copy;
          });
          return;
        }
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

      const next = cloneGrid(grid);
      next[row][col] = digit;
      setGrid(next);

      if (digit === 0) {
        void playSound('erase');
        return;
      }
      if (isValidPlacement(next, row, col, digit, true)) {
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
    },
    [selected, givensMask, noteMode, grid, checkUnitComplete, tryWin],
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
          <View style={styles.padRow}>
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <Pressable
                key={d}
                style={({ pressed }) => [styles.padKey, pressed && styles.padKeyPressed]}
                onPress={() => placeDigit(d)}
                accessibilityRole="button"
                accessibilityLabel={`Enter ${d}`}
              >
                <Text style={styles.padDigit}>{d}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [styles.eraseKey, pressed && styles.padKeyPressed]}
            onPress={() => placeDigit(0)}
            accessibilityRole="button"
          >
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
    color: palette.plum,
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
    width: BOARD_WIDTH,
    maxWidth: '100%',
    marginTop: 24,
    gap: 10,
  },
  padRow: {
    flexDirection: 'row',
    gap: 6,
  },
  padKey: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.padKey,
    borderWidth: 1.5,
    borderColor: palette.padBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padKeyPressed: {
    backgroundColor: palette.selected,
    borderColor: palette.plum,
  },
  padDigit: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.plum,
  },
  eraseKey: {
    height: 48,
    borderRadius: 14,
    backgroundColor: palette.blush,
    borderWidth: 1.5,
    borderColor: palette.blushDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraseText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
});
