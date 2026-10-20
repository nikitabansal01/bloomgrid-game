import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SUDOKU_SIZE, colors } from '../theme';

type Props = {
  onPick: (n: number) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function NumberPad({ onPick, onClear, disabled }: Props) {
  const nums = Array.from({ length: SUDOKU_SIZE }, (_, i) => i + 1);

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {nums.slice(0, 3).map((n) => (
          <PadKey key={n} n={n} onPress={() => onPick(n)} disabled={disabled} />
        ))}
      </View>
      <View style={styles.row}>
        {nums.slice(3).map((n) => (
          <PadKey key={n} n={n} onPress={() => onPick(n)} disabled={disabled} />
        ))}
        <Pressable
          style={[styles.key, styles.clearKey, disabled && styles.keyDisabled]}
          onPress={onClear}
          disabled={disabled}
        >
          <Text style={styles.clearText}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PadKey({ n, onPress, disabled }: { n: number; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={[styles.key, disabled && styles.keyDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.keyText}>{n}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  key: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  keyDisabled: {
    opacity: 0.45,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  clearKey: {
    backgroundColor: colors.mint,
  },
  clearText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
});
