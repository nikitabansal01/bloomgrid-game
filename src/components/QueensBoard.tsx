import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Board, Regions } from '../game/queens';
import { palette, regionColors, THEME_TOKEN } from '../theme/colors';

type Props = {
  board: Board;
  regions: Regions;
  conflicts: boolean[][];
  onTap: (row: number, col: number) => void;
  onLongPress?: (row: number, col: number) => void;
};

const THIN = 1;
const THICK = 3;
const FRAME = 3;
const MAX_BOARD = 432;
const SIDE_MARGIN = 40;

/** One cell size for the whole board; every cell is exactly this square. */
export function useCellSize(size: number): number {
  const { width } = useWindowDimensions();
  const available = Math.min(width - SIDE_MARGIN, MAX_BOARD);
  return Math.max(28, Math.floor(available / size));
}

export function QueensBoard({ board, regions, conflicts, onTap, onLongPress }: Props) {
  const size = board.length;
  const cell = useCellSize(size);
  const boardPx = cell * size;
  const tokenPx = Math.round(cell * 0.72);

  const lines: React.ReactNode[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 1; c < size; c++) {
      const thick = regions[r][c] !== regions[r][c - 1];
      const t = thick ? THICK : THIN;
      lines.push(
        <View
          key={`v${r}-${c}`}
          style={[
            styles.line,
            thick ? styles.lineThick : styles.lineThin,
            {
              left: c * cell - t / 2,
              top: r * cell - (thick ? THICK / 2 : 0),
              width: t,
              height: cell + (thick ? THICK : 0),
            },
          ]}
        />,
      );
    }
  }
  for (let r = 1; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const thick = regions[r][c] !== regions[r - 1][c];
      const t = thick ? THICK : THIN;
      lines.push(
        <View
          key={`h${r}-${c}`}
          style={[
            styles.line,
            thick ? styles.lineThick : styles.lineThin,
            {
              top: r * cell - t / 2,
              left: c * cell - (thick ? THICK / 2 : 0),
              height: t,
              width: cell + (thick ? THICK : 0),
            },
          ]}
        />,
      );
    }
  }

  return (
    <View style={[styles.board, { width: boardPx, height: boardPx }]}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((mark, c) => {
            const conflict = conflicts[r][c];
            const label =
              mark === 'token'
                ? `token${conflict ? ', breaks a rule' : ''}`
                : mark === 'cross'
                  ? 'crossed out'
                  : 'empty';
            return (
              <Pressable
                key={c}
                onPress={() => onTap(r, c)}
                onLongPress={onLongPress ? () => onLongPress(r, c) : undefined}
                style={{
                  width: cell,
                  height: cell,
                  backgroundColor: regionColors[regions[r][c] % regionColors.length],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel={`Row ${r + 1} column ${c + 1}, ${label}`}
              >
                {mark === 'token' ? (
                  <View
                    style={[
                      styles.token,
                      { width: tokenPx, height: tokenPx, borderRadius: tokenPx / 2 },
                      conflict && styles.tokenConflict,
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: Math.round(tokenPx * 0.52),
                        lineHeight: Math.round(tokenPx * 0.7),
                        textAlign: 'center',
                      }}
                    >
                      {THEME_TOKEN}
                    </Text>
                  </View>
                ) : mark === 'cross' ? (
                  <Text style={[styles.cross, { fontSize: Math.round(cell * 0.38) }]}>✕</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {lines}
        <View style={styles.frame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  line: {
    position: 'absolute',
  },
  lineThin: {
    backgroundColor: 'rgba(74, 63, 85, 0.22)',
  },
  lineThick: {
    backgroundColor: palette.ink,
  },
  frame: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: FRAME,
    borderColor: palette.ink,
    borderRadius: 12,
  },
  token: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: palette.plum,
  },
  tokenConflict: {
    backgroundColor: palette.conflict,
    borderColor: palette.conflictInk,
    borderWidth: 3,
  },
  cross: {
    color: palette.ink,
    fontWeight: '700',
  },
});
