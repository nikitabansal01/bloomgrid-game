import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuBanner } from '../ads/AdProvider';
import { colors } from '../theme';

type Props = {
  bestScore: number;
  onPlay: () => void;
};

export function MenuScreen({ bestScore, onPlay }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>CASUAL ARCADE</Text>
        <Text style={styles.title}>NeonSlice</Text>
        <Text style={styles.subtitle}>Slide. Tap. Stack the perfect neon tower.</Text>
        {bestScore > 0 && (
          <Text style={styles.best}>Personal best · {bestScore} layers</Text>
        )}
        <Pressable style={styles.playBtn} onPress={onPlay}>
          <Text style={styles.playText}>Play</Text>
        </Pressable>
      </View>
      <View style={styles.bannerSlot}>
        <MenuBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  kicker: {
    color: colors.neonCyan,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '700',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    textShadowColor: colors.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 280,
  },
  best: {
    marginTop: 8,
    color: colors.neonYellow,
    fontWeight: '600',
  },
  playBtn: {
    marginTop: 24,
    backgroundColor: colors.neonPink,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: colors.neonPink,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
  playText: {
    color: colors.bg,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerSlot: {
    alignItems: 'center',
    minHeight: 50,
  },
});
