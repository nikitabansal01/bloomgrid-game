import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuBanner } from '../ads/AdProvider';
import { CatMascot } from '../components/CatMascot';
import type { ProgressStats } from '../storage/progress';
import { colors } from '../theme';

type Props = {
  progress: ProgressStats;
  muted: boolean;
  onToggleMute: () => void;
  onPlay: () => void;
};

export function MenuScreen({ progress, muted, onToggleMute, onPlay }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <CatMascot size={72} />
        <Text style={styles.title}>Meowdoku</Text>
        <Text style={styles.subtitle}>cozy cat sudoku</Text>
        <View style={styles.statsCard}>
          <Stat label="Streak" value={`${progress.streakDays} day${progress.streakDays === 1 ? '' : 's'}`} />
          <Stat label="Today" value={`${progress.puzzlesToday} solved`} />
          <Stat
            label="Best time"
            value={progress.bestTimeSec != null ? formatTime(progress.bestTimeSec) : '—'}
          />
        </View>
        <Pressable style={styles.playBtn} onPress={onPlay}>
          <Text style={styles.playText}>New puzzle</Text>
        </Pressable>
        <Pressable style={styles.muteBtn} onPress={onToggleMute}>
          <Text style={styles.muteText}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</Text>
        </Pressable>
      </View>
      <View style={styles.bannerSlot}>
        <MenuBanner />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
  },
  statsCard: {
    marginTop: 20,
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: colors.accentDark,
  },
  playBtn: {
    marginTop: 24,
    backgroundColor: colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  muteBtn: {
    marginTop: 12,
    padding: 8,
  },
  muteText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  bannerSlot: {
    alignItems: 'center',
    minHeight: 50,
  },
});
