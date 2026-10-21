import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AdProvider } from './src/ads/AdProvider';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { WinScreen } from './src/screens/WinScreen';
import { palette } from './src/theme/colors';

type Screen = 'home' | 'game' | 'win';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [puzzleDate, setPuzzleDate] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <AdProvider>
        <StatusBar style="dark" />
        {screen === 'home' && <HomeScreen onPlay={() => setScreen('game')} />}
        {screen === 'game' && (
          <GameScreen
            onBack={() => setScreen('home')}
            onWin={(sec, date) => {
              setSessionSeconds(sec);
              setPuzzleDate(date);
              setScreen('win');
            }}
          />
        )}
        {screen === 'win' && (
          <WinScreen
            sessionSeconds={sessionSeconds}
            puzzleDate={puzzleDate ?? undefined}
            onHome={() => setScreen('home')}
          />
        )}
      </AdProvider>
    </SafeAreaProvider>
  );
}
