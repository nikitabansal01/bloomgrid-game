import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAds } from '../ads/AdProvider';
import { AffirmationBackdrop } from '../components/AffirmationBackdrop';
import { CycleMascot } from '../components/CycleMascot';
import { MoodPicker } from '../components/MoodPicker';
import {
  getShareLine,
  loadStreak,
  recordDailyWin,
  saveMoodForToday,
  StreakData,
} from '../storage/gameStorage';
import { HealthDisclaimer } from '../components/HealthDisclaimer';
import { cycleCopy, palette } from '../theme/colors';

type Props = {
  sessionSeconds: number;
  onHome: () => void;
};

export function WinScreen({ sessionSeconds, onHome }: Props) {
  const { showInterstitialIfAllowed } = useAds();
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: null });
  const [mood, setMood] = useState<string | null>(null);
  const copy = cycleCopy[(new Date().getDate() + 2) % cycleCopy.length];

  useEffect(() => {
    (async () => {
      const s = await recordDailyWin();
      setStreak(s);
      await showInterstitialIfAllowed(sessionSeconds);
    })();
  }, [sessionSeconds, showInterstitialIfAllowed]);

  const onShare = async () => {
    const message = await getShareLine(streak.count);
    try {
      await Share.share({ message });
    } catch {
      /* user cancelled */
    }
  };

  const onMood = async (emoji: string) => {
    setMood(emoji);
    await saveMoodForToday(emoji);
  };

  return (
    <View style={styles.root}>
      <AffirmationBackdrop active />
      <ScrollView contentContainerStyle={styles.scroll}>
        <CycleMascot mood="celebrate" size={64} />
        <Text style={styles.title}>You did it ✿</Text>
        <Text style={styles.sub}>{copy}</Text>
        <Text style={styles.normalize}>
          However your body feels today is valid — this win is just for you.
        </Text>

        <View style={styles.streakCard}>
          <Text style={styles.streakNum}>{streak.count}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>

        <MoodPicker onPick={onMood} selected={mood} />

        <Pressable style={styles.shareBtn} onPress={onShare}>
          <Text style={styles.shareText}>Share screenshot moment</Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={onHome}>
          <Text style={styles.homeText}>Back home</Text>
        </Pressable>

        <HealthDisclaimer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scroll: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.ink,
    marginTop: 16,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.inkSoft,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
  normalize: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.inkSoft,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
    fontStyle: 'italic',
  },
  streakCard: {
    marginTop: 28,
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.sage,
  },
  streakNum: {
    fontSize: 48,
    fontWeight: '700',
    color: palette.sageDeep,
  },
  streakLabel: {
    fontSize: 14,
    color: palette.inkSoft,
    marginTop: 4,
  },
  shareBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: palette.blush,
    borderWidth: 1,
    borderColor: palette.blushDeep,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  homeBtn: {
    marginTop: 16,
    paddingVertical: 12,
  },
  homeText: {
    fontSize: 16,
    color: palette.lavenderDeep,
    fontWeight: '600',
  },
});
