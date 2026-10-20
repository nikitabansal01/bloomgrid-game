import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HealthDisclaimer } from '../components/HealthDisclaimer';
import { MenuBanner } from '../ads/AdProvider';
import { CatMascot } from '../components/CatMascot';
import { dailySeed } from '../game/sudoku';
import { loadStreak, StreakData } from '../storage/gameStorage';
import { cycleCopy, palette } from '../theme/colors';

type Props = {
  onPlay: () => void;
};

export function HomeScreen({ onPlay }: Props) {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: null });
  const copyIndex = new Date().getDate() % cycleCopy.length;

  const refresh = useCallback(async () => {
    setStreak(await loadStreak());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <CatMascot size={48} />
          <Text style={styles.title}>BloomGrid</Text>
          <Text style={styles.tagline}>Soft sudoku for every phase of your cycle</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today&apos;s puzzle</Text>
          <Text style={styles.date}>{dailySeed()}</Text>
          <Text style={styles.body}>{cycleCopy[copyIndex]}</Text>
          {streak.count > 0 ? (
            <Text style={styles.streak}>✿ {streak.count} day streak</Text>
          ) : (
            <Text style={styles.streakMuted}>Start a gentle streak today</Text>
          )}
          <Pressable style={styles.playBtn} onPress={onPlay} accessibilityRole="button">
            <Text style={styles.playText}>Play daily grid</Text>
          </Pressable>
        </View>

        <HealthDisclaimer compact />
      </ScrollView>
      <MenuBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: palette.ink,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: palette.inkSoft,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.blush,
    shadowColor: palette.lavenderDeep,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.lavenderDeep,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.ink,
    marginTop: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.inkSoft,
    marginTop: 16,
  },
  streak: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: palette.sageDeep,
  },
  streakMuted: {
    marginTop: 16,
    fontSize: 14,
    color: palette.inkSoft,
  },
  playBtn: {
    marginTop: 20,
    backgroundColor: palette.lavenderDeep,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  playText: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: palette.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
});
