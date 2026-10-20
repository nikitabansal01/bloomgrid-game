import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/** Google sample ad unit IDs — replace before production (see README). */
export const AD_UNITS = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
} as const;

export const TEST_APP_IDS = {
  ios: 'ca-app-pub-3940256099942544~1458002511',
  android: 'ca-app-pub-3940256099942544~3347511713',
} as const;

export function adsSupportedOnPlatform(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
