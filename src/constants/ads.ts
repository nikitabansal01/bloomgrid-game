import { TestIds } from 'react-native-google-mobile-ads';

/** Google-provided test unit IDs — replace before App Store / Play release. */
export const AD_UNIT_IDS = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
} as const;

/** Minimum run length (ms) before showing an interstitial on game over. */
export const INTERSTITIAL_MIN_RUN_MS = 30_000;
