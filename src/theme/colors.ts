export const palette = {
  cream: '#FFF8F3',
  blush: '#F5D5D8',
  blushDeep: '#E8B4BC',
  lavender: '#E8E0F0',
  lavenderDeep: '#C9B8E0',
  sage: '#D4E4D2',
  sageDeep: '#A8C4A4',
  ink: '#4A3F55',
  inkSoft: '#6E6380',
  white: '#FFFFFF',
  // Text-safe accents: each is >= 4.5:1 against white, cream, and the region fills.
  plum: '#5B3F86',
  sageInk: '#4E7A49',
  conflictInk: '#9B1C3A',
  buttonFill: '#F3EEFA',
  buttonBorder: '#9C86C2',
  conflict: '#FAD0D3',
} as const;

/** The single swappable theme token placed on the board (e.g. '🌸'). */
export const THEME_TOKEN = '🩸';

/** Soft region fills, one per region (supports boards up to 8×8). Ink text stays >= 7:1 on each. */
export const regionColors = [
  '#F8D7DC',
  '#E4DAF3',
  '#D6E8D3',
  '#FCE3C8',
  '#D3E4F3',
  '#F6EDB9',
  '#CDEBE4',
  '#EFD3EA',
] as const;

export const affirmations = [
  'Rest',
  'Flow',
  'Brave',
  'Enough',
  'Gentle',
  'Strong',
  'Valid',
  'Breathe',
] as const;

export const cycleCopy = [
  'Your cycle is natural — puzzles are a small pause just for you.',
  'However today feels, you belong here. No judgment, only gentle play.',
  'Energy shifts through the month. This grid meets you where you are.',
  'Taking a breath counts. So does showing up for yourself.',
] as const;
