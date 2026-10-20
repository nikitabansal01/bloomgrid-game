import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AdProvider, useAds } from './src/ads/AdProvider';
import { useGameAudio } from './src/audio/useGameAudio';
import { CompleteScreen } from './src/screens/CompleteScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { useSudokuGame } from './src/game/useSudokuGame';
import {
  loadMuted,
  loadProgress,
  recordPuzzleWin,
  saveMuted,
  type ProgressStats,
} from './src/storage/progress';
import { colors } from './src/theme';

type Screen = 'menu' | 'play' | 'complete';

function GameRoot() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [progress, setProgress] = useState<ProgressStats>({
    streakDays: 0,
    lastPlayDate: null,
    puzzlesToday: 0,
    bestTimeSec: null,
    totalSolved: 0,
  });
  const [muted, setMuted] = useState(false);
  const [completeElapsed, setCompleteElapsed] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const winHandled = useRef(false);

  const {
    state,
    selectCell,
    placeValue,
    clearCell,
    applyHint,
    resetRun,
    sessionSeconds,
    clearAffirmation,
  } = useSudokuGame();
  const { showInterstitialIfAllowed } = useAds();
  const { playPlace, playWin } = useGameAudio(muted);

  useEffect(() => {
    void loadProgress().then(setProgress);
    void loadMuted().then(setMuted);
  }, []);

  useEffect(() => {
    if (state.phase !== 'won' || screen !== 'play') return;
    if (winHandled.current) return;
    winHandled.current = true;
    const elapsed = sessionSeconds();
    setCompleteElapsed(elapsed);
    void (async () => {
      playWin();
      const prevBest = progress.bestTimeSec;
      const updated = await recordPuzzleWin(elapsed);
      setProgress(updated);
      setIsNewBest(prevBest == null || elapsed < prevBest);
      setScreen('complete');
      await showInterstitialIfAllowed(elapsed);
    })();
  }, [
    state.phase,
    screen,
    sessionSeconds,
    showInterstitialIfAllowed,
    playWin,
    progress.bestTimeSec,
  ]);

  const startPlay = useCallback(() => {
    winHandled.current = false;
    resetRun();
    setScreen('play');
  }, [resetRun]);

  const handleToggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      void saveMuted(next);
      return next;
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen === 'menu' && (
        <MenuScreen
          progress={progress}
          muted={muted}
          onToggleMute={handleToggleMute}
          onPlay={startPlay}
        />
      )}
      {screen === 'play' && (
        <PlayScreen
          state={state}
          startedAt={state.startedAt}
          onSelect={selectCell}
          onPick={placeValue}
          onClear={clearCell}
          onHint={applyHint}
          onAffirmationDone={clearAffirmation}
          onPlaceSound={playPlace}
        />
      )}
      {screen === 'complete' && (
        <CompleteScreen
          elapsedSec={completeElapsed}
          progress={progress}
          isNewBest={isNewBest}
          onPlayAgain={startPlay}
          onMenu={() => setScreen('menu')}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AdProvider>
      <GameRoot />
    </AdProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
