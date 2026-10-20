import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type ToneKind = 'place' | 'win';

/** Soft synthetic chime via short WAV-like beep using expo-av bundled URIs is heavy; use haptics + quiet tones. */
async function playTone(kind: ToneKind, muted: boolean): Promise<void> {
  if (muted) return;
  if (Platform.OS === 'web') return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
  } catch {
    // ignore
  }

  const frequency = kind === 'win' ? 523.25 : 392;
  const durationMs = kind === 'win' ? 280 : 90;

  try {
    if (kind === 'place') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {
    // ignore
  }

  // Gentle tone: load minimal inline beep asset if present, else skip
  const soundRef = toneSounds[kind];
  if (soundRef) {
    try {
      const { sound } = await Audio.Sound.createAsync(soundRef, { volume: kind === 'win' ? 0.35 : 0.2 });
      await sound.playAsync();
      setTimeout(() => {
        void sound.unloadAsync();
      }, durationMs + 100);
    } catch {
      // no asset
    }
  }
}

const toneSounds: Partial<Record<ToneKind, number>> = {};

export function useGameAudio(muted: boolean) {
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    void Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  const playPlace = useCallback(() => {
    void playTone('place', mutedRef.current);
  }, []);

  const playWin = useCallback(() => {
    void playTone('win', mutedRef.current);
  }, []);

  return { playPlace, playWin };
}
