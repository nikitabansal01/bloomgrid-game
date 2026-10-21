import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { playSound } from '../audio/soundManager';
import { QueensBoard, useCellSize } from '../components/QueensBoard';
import {
  Board,
  dailySeed,
  emptyBoard,
  generatePuzzle,
  getConflicts,
  isSolved,
  isValidPlacement,
  Mark,
  nextMark,
  tokensOf,
} from '../game/queens';
import { palette, THEME_TOKEN } from '../theme/colors';

export const BOARD_SIZE = 6;

type Props = {
  onWin: (sessionSeconds: number, puzzleDate: string) => void;
  onBack: () => void;
};

export function GameScreen({ onWin, onBack }: Props) {
  // Fixed for the lifetime of this game so the puzzle can't change at midnight mid-play.
  const [seed] = useState(() => dailySeed());
  const { regions } = useMemo(() => generatePuzzle(seed, BOARD_SIZE), [seed]);

  const [board, setBoard] = useState<Board>(() => emptyBoard(BOARD_SIZE));
  const startedAt = useRef(Date.now());
  const won = useRef(false);
  const conflicts = useMemo(() => getConflicts(board, regions), [board, regions]);
  const placed = tokensOf(board).length;
  const boardWidth = useCellSize(BOARD_SIZE) * BOARD_SIZE;

  const setMark = useCallback(
    (row: number, col: number, mark: Mark) => {
      if (won.current) return;
      const previous = board[row][col];
      const next = board.map((r) => [...r]);
      next[row][col] = mark;
      setBoard(next);

      if (mark === 'token') {
        const others = board.map((r) => [...r]);
        others[row][col] = 'empty';
        if (isValidPlacement(others, regions, { row, col })) {
          void playSound('place');
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else if (previous === 'token') {
        void playSound('erase');
      } else {
        void Haptics.selectionAsync();
      }

      if (isSolved(next, regions)) {
        won.current = true;
        void playSound('win');
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onWin(Math.floor((Date.now() - startedAt.current) / 1000), seed);
      }
    },
    [board, regions, onWin, seed],
  );

  const onTap = useCallback(
    (row: number, col: number) => setMark(row, col, nextMark(board[row][col])),
    [board, setMark],
  );

  const onLongPress = useCallback(
    (row: number, col: number) =>
      setMark(row, col, board[row][col] === 'token' ? 'empty' : 'token'),
    [board, setMark],
  );

  const onClear = () => {
    if (won.current) return;
    setBoard(emptyBoard(BOARD_SIZE));
    void playSound('erase');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.topBar, { width: boardWidth }]}>
          <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button">
            <Text style={styles.back}>← Home</Text>
          </Pressable>
          <Text style={styles.heading}>Daily bloom</Text>
          <Pressable onPress={onClear} style={styles.clearBtn} accessibilityRole="button">
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        </View>

        <Text style={[styles.rules, { maxWidth: boardWidth }]}>
          Place one {THEME_TOKEN} in every row, column, and color. Tokens can&apos;t touch — not
          even diagonally.
        </Text>

        <QueensBoard
          board={board}
          regions={regions}
          conflicts={conflicts}
          onTap={onTap}
          onLongPress={onLongPress}
        />

        <View style={[styles.footer, { width: boardWidth }]}>
          <Text style={styles.hint}>Tap: ✕ → {THEME_TOKEN} → empty · Hold: {THEME_TOKEN}</Text>
          <Text style={styles.progress} accessibilityLiveRegion="polite">
            {placed} / {BOARD_SIZE} placed
          </Text>
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
    paddingVertical: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  back: {
    color: palette.plum,
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: palette.buttonBorder,
    backgroundColor: palette.buttonFill,
  },
  clearText: {
    fontSize: 14,
    color: palette.plum,
    fontWeight: '700',
  },
  rules: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink,
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
    color: palette.inkSoft,
  },
  progress: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.plum,
  },
});
