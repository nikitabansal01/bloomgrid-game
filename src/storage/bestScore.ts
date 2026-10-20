import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@stack_rush/best_score';

export async function loadBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, String(score));
  } catch {
    // ignore persistence errors
  }
}
