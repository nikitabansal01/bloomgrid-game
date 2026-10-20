import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@meowdoku/progress';
const MUTE_KEY = '@meowdoku/mute';

export type ProgressStats = {
  streakDays: number;
  lastPlayDate: string | null;
  puzzlesToday: number;
  bestTimeSec: number | null;
  totalSolved: number;
};

const defaultStats = (): ProgressStats => ({
  streakDays: 0,
  lastPlayDate: null,
  puzzlesToday: 0,
  bestTimeSec: null,
  totalSolved: 0,
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function loadProgress(): Promise<ProgressStats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as ProgressStats;
    const today = todayKey();
    if (parsed.lastPlayDate !== today) {
      return { ...parsed, puzzlesToday: 0 };
    }
    return parsed;
  } catch {
    return defaultStats();
  }
}

export async function recordPuzzleWin(elapsedSec: number): Promise<ProgressStats> {
  const prev = await loadProgress();
  const today = todayKey();
  let streak = prev.streakDays;
  if (prev.lastPlayDate === today) {
    // same day
  } else if (prev.lastPlayDate === yesterdayKey()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const puzzlesToday = prev.lastPlayDate === today ? prev.puzzlesToday + 1 : 1;
  const bestTimeSec =
    prev.bestTimeSec == null ? elapsedSec : Math.min(prev.bestTimeSec, elapsedSec);

  const next: ProgressStats = {
    streakDays: streak,
    lastPlayDate: today,
    puzzlesToday,
    bestTimeSec,
    totalSolved: prev.totalSolved + 1,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function loadMuted(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(MUTE_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function saveMuted(muted: boolean): Promise<void> {
  await AsyncStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}
