import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, INTERSTITIAL_MIN_RUN_MS } from '../constants/ads';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export function useInterstitialOnGameOver() {
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isNative) return;

    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
    interstitialRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      ad.load();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, []);

  const showIfEligible = useCallback(async (runDurationMs: number) => {
    if (!isNative || runDurationMs < INTERSTITIAL_MIN_RUN_MS) return;
    const ad = interstitialRef.current;
    if (!ad || !loadedRef.current) return;
    try {
      await ad.show();
    } catch {
      // ad not ready
    }
  }, []);

  return { showIfEligible };
}

export function useRewardedContinue() {
  const rewardedRef = useRef<RewardedAd | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isNative) return;

    const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded);
    rewardedRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      ad.load();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, []);

  const showRewarded = useCallback((): Promise<boolean> => {
    if (!isNative) return Promise.resolve(true);

    return new Promise((resolve) => {
      const ad = rewardedRef.current;
      if (!ad || !loadedRef.current) {
        resolve(false);
        return;
      }

      let earned = false;
      const unsubEarned = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        resolve(earned);
      });

      ad.show().catch(() => {
        unsubEarned();
        unsubClosed();
        resolve(false);
      });
    });
  }, []);

  return { showRewarded, isNative };
}
