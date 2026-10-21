import { Audio } from 'expo-av';

/** SFX: procedurally generated sine tones in assets/sounds/ (see scripts/generate-sounds.mjs). */
const sources = {
  place: require('../../assets/sounds/place.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  win: require('../../assets/sounds/win.wav'),
  erase: require('../../assets/sounds/erase.wav'),
} as const;

type SoundKey = keyof typeof sources;

let initialized = false;

async function ensureAudio() {
  if (initialized) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
  initialized = true;
}

export async function playSound(key: SoundKey): Promise<void> {
  try {
    await ensureAudio();
    const { sound } = await Audio.Sound.createAsync(sources[key], { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        void sound.unloadAsync();
      }
    });
  } catch {
    /* audio optional */
  }
}
