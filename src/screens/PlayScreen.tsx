import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAds } from '../ads/AdProvider';
import { AffirmationFlash } from '../components/AffirmationFlash';
import { CatMascot } from '../components/CatMascot';
import { NumberPad } from '../components/NumberPad';
import { SudokuBoard } from '../components/SudokuBoard';
import type { SudokuGameState } from '../game/useSudokuGame';
import { colors } from '../theme';

type Props = {
  state: SudokuGameState;
  startedAt: number;
  onSelect: (row: number, col: number) => void;
  onPick: (n: number) => void;
  onClear: () => void;
  onHint: () => void;
  onAffirmationDone: () => void;
  onPlaceSound: () => void;
};

export function PlayScreen({
  state,
  startedAt,
  onSelect,
  onPick,
  onClear,
  onHint,
  onAffirmationDone,
  onPlaceSound,
}: Props) {
  const { showRewardedContinue } = useAds();
  const [loadingHint, setLoadingHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const handlePick = (n: number) => {
    onPick(n);
    onPlaceSound();
  };

  const handleHint = async () => {
    if (state.hintUsed) return;
    setLoadingHint(true);
    try {
      const ok = await showRewardedContinue();
      if (ok) onHint();
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.wash} />
      <View style={styles.header}>
        <CatMascot size={36} />
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        <Pressable
          style={[styles.hintBtn, state.hintUsed && styles.hintUsed]}
          onPress={handleHint}
          disabled={state.hintUsed || loadingHint}
        >
          {loadingHint ? (
            <ActivityIndicator color={colors.accentDark} size="small" />
          ) : (
            <Text style={styles.hintText}>{state.hintUsed ? 'Hint used' : 'Hint 🎬'}</Text>
          )}
        </Pressable>
      </View>
      <SudokuBoard state={state} onSelect={onSelect} />
      <NumberPad
        onPick={handlePick}
        onClear={onClear}
        disabled={!state.selected || state.phase !== 'playing'}
      />
      <AffirmationFlash event={state.affirmation} onDone={onAffirmationDone} />
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
    paddingTop: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.lavender,
    opacity: 0.18,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timer: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  hintBtn: {
    backgroundColor: colors.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 96,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  hintUsed: {
    opacity: 0.6,
  },
  hintText: {
    fontWeight: '700',
    color: colors.accentDark,
    fontSize: 14,
  },
});
