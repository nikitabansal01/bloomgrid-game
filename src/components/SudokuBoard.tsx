import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SudokuGameState } from '../game/useSudokuGame';
import { BOX_HEIGHT, BOX_WIDTH, colors, SUDOKU_SIZE } from '../theme';

type Props = {
  state: SudokuGameState;
  onSelect: (row: number, col: number) => void;
};

export function SudokuBoard({ state, onSelect }: Props) {
  const { grid, givens, selected, conflicts } = state;
  const cellSize = 46;

  return (
    <View style={[styles.board, { width: cellSize * SUDOKU_SIZE + 8 }]}>
      {grid.map((row, r) => (
        <View key={`r-${r}`} style={styles.row}>
          {row.map((value, c) => {
            const isSelected = selected?.row === r && selected?.col === c;
            const isGiven = givens[r][c];
            const isError = conflicts[r][c];
            const thickRight = (c + 1) % BOX_WIDTH === 0 && c < SUDOKU_SIZE - 1;
            const thickBottom = (r + 1) % BOX_HEIGHT === 0 && r < SUDOKU_SIZE - 1;

            return (
              <Pressable
                key={`c-${r}-${c}`}
                onPress={() => onSelect(r, c)}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRightWidth: thickRight ? 2.5 : 1,
                    borderBottomWidth: thickBottom ? 2.5 : 1,
                    borderRightColor: thickRight ? colors.gridLineBold : colors.gridLine,
                    borderBottomColor: thickBottom ? colors.gridLineBold : colors.gridLine,
                  },
                  isGiven && styles.cellGiven,
                  isSelected && styles.cellSelected,
                  isError && styles.cellError,
                ]}
              >
                <Text style={[styles.digit, isGiven && styles.digitGiven, isError && styles.digitError]}>
                  {value > 0 ? value : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.gridLineBold,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.gridLine,
  },
  cellGiven: {
    backgroundColor: colors.cellGiven,
  },
  cellSelected: {
    backgroundColor: colors.cellSelected,
  },
  cellError: {
    backgroundColor: colors.cellError,
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accentDark,
  },
  digitGiven: {
    color: colors.text,
    fontWeight: '800',
  },
  digitError: {
    color: '#c44',
  },
});
