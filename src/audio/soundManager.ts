import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

/** SFX: procedurally generated sine tones in assets/sounds/ (see scripts/generate-sounds.mjs). */
const sources = {
  place: require('../../assets/sounds/place.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  win: require('../../assets/sounds/win.wav'),
  erase: require('../../assets/sounds/erase.wav'),
} as const;

type SoundKey = keyof typeof sources;

let initialized = false;
const players: Partial<Record<SoundKey, AudioPlayer>> = {};

async function ensureAudio() {
  if (initialized) return;
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
  initialized = true;
}

export async function playSound(key: SoundKey): Promise<void> {
  try {
    await ensureAudio();
    let player = players[key];
    if (!player) {
      player = createAudioPlayer(sources[key]);
      players[key] = player;
    }
    await player.seekTo(0);
    player.play();
  } catch {
    /* audio optional */
  }
}
