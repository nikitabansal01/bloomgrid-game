import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BOX_COLS,
  BOX_ROWS,
  GRID_SIZE,
  getConflicts,
} from '../game/sudoku';
import { palette } from '../theme/colors';

type Props = {
  grid: number[][];
  givensMask: boolean[][];
  notes: number[][][];
  selected: { row: number; col: number } | null;
  onSelect: (row: number, col: number) => void;
};

export function SudokuGrid({ grid, givensMask, notes, selected, onSelect }: Props) {
  const conflicts = useMemo(() => getConflicts(grid), [grid]);
  const selVal =
    selected != null ? grid[selected.row][selected.col] : 0;

  return (
    <View style={styles.board}>
      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: GRID_SIZE }, (_, col) => {
            const val = grid[row][col];
            const isGiven = givensMask[row][col];
            const isSelected = selected?.row === row && selected?.col === col;
            const conflict = conflicts[row][col];
            const sameDigit = selVal !== 0 && val === selVal && !isSelected;
            const thickRight = (col + 1) % BOX_COLS === 0 && col < GRID_SIZE - 1;
            const thickBottom = (row + 1) % BOX_ROWS === 0 && row < GRID_SIZE - 1;
            const cellNotes = notes[row][col];

            return (
              <Pressable
                key={col}
                onPress={() => onSelect(row, col)}
                style={[
                  styles.cell,
                  thickRight && styles.thickRight,
                  thickBottom && styles.thickBottom,
                  isGiven && styles.given,
                  isSelected && styles.selected,
                  sameDigit && styles.sameDigit,
                  conflict && styles.conflict,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Row ${row + 1} column ${col + 1}${val ? ` value ${val}` : ' empty'}`}
              >
                {val !== 0 ? (
                  <Text
                    style={[
                      styles.digit,
                      isGiven && styles.givenDigit,
                      conflict && !isGiven && styles.conflictDigit,
                    ]}
                  >
                    {val}
                  </Text>
                ) : cellNotes.length > 0 ? (
                  <View style={styles.notesWrap}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <Text key={n} style={styles.note}>
                        {cellNotes.includes(n) ? n : ' '}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const cellSize = 48;
const boardBorder = 2;
export const BOARD_WIDTH = cellSize * GRID_SIZE + boardBorder * 2;

const styles = StyleSheet.create({
  board: {
    borderWidth: boardBorder,
    borderColor: palette.ink,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: palette.white,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
  thickRight: {
    borderRightWidth: 2,
    borderRightColor: palette.ink,
  },
  thickBottom: {
    borderBottomWidth: 2,
    borderBottomColor: palette.ink,
  },
  given: {
    backgroundColor: palette.given,
  },
  selected: {
    backgroundColor: palette.selected,
  },
  sameDigit: {
    backgroundColor: palette.highlight,
  },
  conflict: {
    backgroundColor: palette.conflict,
  },
  digit: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.plum,
  },
  givenDigit: {
    color: palette.ink,
    fontWeight: '700',
  },
  conflictDigit: {
    color: palette.conflictInk,
  },
  notesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '92%',
    justifyContent: 'center',
  },
  note: {
    width: '33%',
    textAlign: 'center',
    fontSize: 9,
    color: palette.note,
    lineHeight: 11,
  },
});
