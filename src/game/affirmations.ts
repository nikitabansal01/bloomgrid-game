const POOL = [
  'Brave',
  'Calm',
  'Proud',
  'Focus',
  'Gentle',
  'Yes',
  'Glow',
  'Steady',
  'Kind',
  'Purrfect',
] as const;

let cursor = 0;

/** Next affirmation in rotation (variable reward copy). */
export function nextAffirmation(): string {
  const word = POOL[cursor % POOL.length];
  cursor += 1;
  return word;
}

export function peekAffirmationPool(): readonly string[] {
  return POOL;
}
