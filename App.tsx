import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { GameOverScreen } from './src/components/GameOverScreen';
import { MenuScreen } from './src/components/MenuScreen';
import { StackGameView } from './src/components/StackGameView';
import { COLORS } from './src/constants/theme';
import type { GamePhase, RunSnapshot } from './src/game/types';
import { useInterstitialOnGameOver, useRewardedContinue } from './src/hooks/useAds';
import { loadBestScore, saveBestScore } from './src/storage/bestScore';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [bestScore, setBestScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [resumeSnapshot, setResumeSnapshot] = useState<RunSnapshot | null>(null);
  const [continueLoading, setContinueLoading] = useState(false);

  const runStartedAtRef = useRef<number>(0);
  const continueUsedRef = useRef(false);
  const pendingSnapshotRef = useRef<RunSnapshot | null>(null);

  const { showIfEligible } = useInterstitialOnGameOver();
  const { showRewarded } = useRewardedContinue();

  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      void mobileAds().initialize();
    }
    void loadBestScore().then(setBestScore);
  }, []);

  const beginRun = useCallback((snapshot: RunSnapshot | null) => {
    setResumeSnapshot(snapshot);
    setGameKey((k) => k + 1);
    if (!snapshot) {
      runStartedAtRef.current = Date.now();
      continueUsedRef.current = false;
    }
    setPhase('playing');
  }, []);

  const handleGameOver = useCallback(
    async ({
      score,
      snapshotBeforeMiss,
    }: {
      score: number;
      snapshotBeforeMiss: RunSnapshot | null;
    }) => {
      setLastScore(score);
      pendingSnapshotRef.current = snapshotBeforeMiss;

      const nextBest = Math.max(bestScore, score);
      const newBest = score > bestScore;
      setIsNewBest(newBest);
      if (newBest) {
        setBestScore(nextBest);
        void saveBestScore(nextBest);
      }

      setPhase('gameOver');

      const runMs = Date.now() - runStartedAtRef.current;
      await showIfEligible(runMs);
    },
    [bestScore, showIfEligible],
  );

  const handleContinue = useCallback(async () => {
    if (continueUsedRef.current || !pendingSnapshotRef.current) return;
    setContinueLoading(true);
    const earned = await showRewarded();
    setContinueLoading(false);
    if (!earned || !pendingSnapshotRef.current) return;
    continueUsedRef.current = true;
    beginRun(pendingSnapshotRef.current);
  }, [beginRun, showRewarded]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {phase === 'menu' ? (
        <MenuScreen bestScore={bestScore} onPlay={() => beginRun(null)} />
      ) : null}
      {phase === 'playing' ? (
        <StackGameView
          key={gameKey}
          resumeFrom={resumeSnapshot}
          onRunStart={() => {
            if (!resumeSnapshot) {
              runStartedAtRef.current = Date.now();
            }
          }}
          onGameOver={handleGameOver}
        />
      ) : null}
      {phase === 'gameOver' ? (
        <GameOverScreen
          score={lastScore}
          bestScore={Math.max(bestScore, lastScore)}
          isNewBest={isNewBest}
          canContinue={!continueUsedRef.current && pendingSnapshotRef.current != null}
          continueLoading={continueLoading}
          onContinue={handleContinue}
          onPlayAgain={() => beginRun(null)}
          onMenu={() => setPhase('menu')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
