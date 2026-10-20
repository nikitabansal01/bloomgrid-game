import AsyncStorage from '@react-native-async-storage/async-storage';

const BEST_SCORE_KEY = '@neonslice/best_score';

export async function loadBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BEST_SCORE_KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<number> {
  const current = await loadBestScore();
  if (score <= current) return current;
  await AsyncStorage.setItem(BEST_SCORE_KEY, String(score));
  return score;
}
