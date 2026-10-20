import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackBoard } from '../components/StackBoard';
import type { StackGameState } from '../game/useStackGame';
import { colors } from '../theme';

type Props = {
  state: StackGameState;
  onTap: () => void;
};

export function PlayScreen({ state, onTap }: Props) {
  const { stats, combo } = state;
  return (
    <View style={styles.root}>
      <View style={styles.hud}>
        <View>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{stats.score}</Text>
        </View>
        <View style={styles.hudCenter}>
          <Text style={styles.hudLabel}>LAYERS</Text>
          <Text style={styles.hudValue}>{Math.max(0, state.layer - 1)}</Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudLabel}>COMBO</Text>
          <Text style={styles.hudValue}>{combo > 0 ? `${combo}x` : '—'}</Text>
        </View>
      </View>
      <StackBoard state={state} onTap={onTap} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  hudCenter: { alignItems: 'center' },
  hudRight: { alignItems: 'flex-end' },
  hudLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  hudValue: {
    color: colors.neonCyan,
    fontSize: 28,
    fontWeight: '800',
  },
});
