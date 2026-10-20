import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AdProvider, useAds } from './src/ads/AdProvider';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { useStackGame } from './src/game/useStackGame';
import { loadBestScore, saveBestScore } from './src/storage/bestScore';
import { colors } from './src/theme';

type Screen = 'menu' | 'play' | 'gameover';

function GameRoot() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [bestScore, setBestScore] = useState(0);
  const { state, placeBlock, resetRun, continueAfterAd, sessionSeconds } = useStackGame();
  const { showInterstitialIfAllowed } = useAds();

  useEffect(() => {
    void loadBestScore().then(setBestScore);
  }, []);

  useEffect(() => {
    if (state.phase !== 'gameover' || screen !== 'play') return;
    setScreen('gameover');
    void (async () => {
      const updated = await saveBestScore(state.stats.score);
      setBestScore(updated);
      await showInterstitialIfAllowed(sessionSeconds());
    })();
  }, [state.phase, screen, state.stats.score, showInterstitialIfAllowed, sessionSeconds]);

  const startPlay = useCallback(() => {
    resetRun();
    setScreen('play');
  }, [resetRun]);

  const handleRetry = useCallback(() => {
    resetRun();
    setScreen('play');
  }, [resetRun]);

  const handleContinue = useCallback(async () => {
    continueAfterAd();
    setScreen('play');
  }, [continueAfterAd]);

  const layers = Math.max(0, state.layer - 1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {screen === 'menu' && <MenuScreen bestScore={bestScore} onPlay={startPlay} />}
      {screen === 'play' && state.phase === 'playing' && (
        <PlayScreen state={state} onTap={placeBlock} />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          stats={state.stats}
          bestScore={bestScore}
          layers={layers}
          continueUsed={state.continueUsed}
          onRetry={handleRetry}
          onMenu={() => setScreen('menu')}
          onContinue={handleContinue}
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
