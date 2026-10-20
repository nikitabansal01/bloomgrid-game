import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuBanner } from '../ads/AdProvider';
import { CatMascot } from '../components/CatMascot';
import type { ProgressStats } from '../storage/progress';
import { colors } from '../theme';

type Props = {
  elapsedSec: number;
  progress: ProgressStats;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
};

export function CompleteScreen({
  elapsedSec,
  progress,
  isNewBest,
  onPlayAgain,
  onMenu,
}: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <CatMascot size={64} />
        <Text style={styles.title}>Puzzle complete!</Text>
        {isNewBest && <Text style={styles.badge}>New best time</Text>}
        <Text style={styles.time}>{formatTime(elapsedSec)}</Text>
        <Text style={styles.meta}>
          {progress.puzzlesToday} today · {progress.streakDays}-day streak · {progress.totalSolved}{' '}
          total
        </Text>
        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onPlayAgain}>
            <Text style={styles.btnPrimaryText}>Another puzzle</Text>
          </Pressable>
          <Pressable onPress={onMenu}>
            <Text style={styles.menuLink}>Main menu</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.bannerSlot}>
        <MenuBanner />
      </View>
    </View>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  badge: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.accentDark,
    lineHeight: 52,
  },
  meta: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  actions: {
    marginTop: 20,
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.accent,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
  menuLink: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  bannerSlot: {
    alignItems: 'center',
    minHeight: 50,
  },
});
