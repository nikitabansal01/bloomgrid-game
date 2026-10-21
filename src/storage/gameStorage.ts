import AsyncStorage from '@react-native-async-storage/async-storage';
import { dailySeed } from '../game/queens';

const KEYS = {
  streak: '@bloomgrid/streak',
  lastPlayed: '@bloomgrid/lastPlayed',
  moodLog: '@bloomgrid/moodLog',
} as const;

export type StreakData = {
  count: number;
  lastDate: string | null;
};

export async function loadStreak(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.streak);
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { count: 0, lastDate: null };
  }
}

export async function recordDailyWin(today = dailySeed()): Promise<StreakData> {
  const current = await loadStreak();
  if (current.lastDate === today) {
    return current;
  }
  const yesterday = previousDay(today);
  let count = 1;
  if (current.lastDate === yesterday) {
    count = current.count + 1;
  }
  const next: StreakData = { count, lastDate: today };
  await AsyncStorage.setItem(KEYS.streak, JSON.stringify(next));
  return next;
}

function previousDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dailySeed(dt);
}

export async function saveMoodForToday(emoji: string, today = dailySeed()): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.moodLog);
    const log: Record<string, string> = raw ? JSON.parse(raw) : {};
    log[today] = emoji;
    await AsyncStorage.setItem(KEYS.moodLog, JSON.stringify(log));
  } catch {
    /* local-only, ignore */
  }
}

export async function getShareLine(streak: number): Promise<string> {
  return `BloomGrid daily ✿ ${dailySeed()} · ${streak} day streak — gentle puzzles, zero judgment.`;
}
