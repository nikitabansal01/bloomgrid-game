import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuBanner, useAds } from '../ads/AdProvider';
import type { RunStats } from '../game/types';
import { colors } from '../theme';

type Props = {
  stats: RunStats;
  bestScore: number;
  layers: number;
  continueUsed: boolean;
  onRetry: () => void;
  onMenu: () => void;
  onContinue: () => Promise<void>;
};

export function buildShareLine(stats: RunStats, layers: number, bestScore: number): string {
  return `NeonSlice — ${layers} layers · ${stats.perfects} perfect · score ${stats.score} · best ${bestScore} 🌈`;
}

export function GameOverScreen({
  stats,
  bestScore,
  layers,
  continueUsed,
  onRetry,
  onMenu,
  onContinue,
}: Props) {
  const { showRewardedContinue } = useAds();
  const [loadingAd, setLoadingAd] = useState(false);
  const shareLine = buildShareLine(stats, layers, bestScore);
  const isNewBest = stats.score >= bestScore && stats.score > 0;

  const handleContinue = async () => {
    setLoadingAd(true);
    try {
      const ok = await showRewardedContinue();
      if (ok) await onContinue();
    } finally {
      setLoadingAd(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Tower fell</Text>
        {isNewBest && <Text style={styles.badge}>NEW BEST</Text>}
        <Text style={styles.scoreBig}>{stats.score}</Text>
        <Text style={styles.meta}>
          {layers} layers · {stats.perfects} perfect · max combo {stats.maxCombo}
        </Text>
        <Text style={styles.bestLine}>Best run · {bestScore}</Text>

        <View style={styles.shareBox}>
          <Text style={styles.shareLabel}>Share your run</Text>
          <Text style={styles.shareLine}>{shareLine}</Text>
        </View>

        <View style={styles.actions}>
          {!continueUsed && (
            <Pressable
              style={[styles.btn, styles.btnSecondary]}
              onPress={handleContinue}
              disabled={loadingAd}
            >
              {loadingAd ? (
                <ActivityIndicator color={colors.neonCyan} />
              ) : (
                <Text style={styles.btnSecondaryText}>Watch ad · Continue once</Text>
              )}
            </Pressable>
          )}
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onRetry}>
            <Text style={styles.btnPrimaryText}>Try again</Text>
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,45,149,0.4)',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '700',
  },
  badge: {
    color: colors.neonYellow,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scoreBig: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.neonPink,
    lineHeight: 60,
  },
  meta: {
    color: colors.text,
    fontSize: 16,
  },
  bestLine: {
    color: colors.neonCyan,
    fontWeight: '600',
  },
  shareBox: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.25)',
  },
  shareLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 6,
    fontWeight: '700',
  },
  shareLine: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  actions: {
    marginTop: 16,
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.neonPink,
  },
  btnPrimaryText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 17,
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: colors.neonCyan,
  },
  btnSecondaryText: {
    color: colors.neonCyan,
    fontWeight: '700',
    fontSize: 15,
  },
  menuLink: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 15,
  },
  bannerSlot: {
    alignItems: 'center',
    minHeight: 50,
  },
});
