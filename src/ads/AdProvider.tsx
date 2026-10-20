import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  MobileAds,
} from 'react-native-google-mobile-ads';
import { AD_UNITS, adsSupportedOnPlatform } from './adUnits';

type AdContextValue = {
  bannerUnitId: string;
  showInterstitialIfAllowed: (sessionSeconds: number) => Promise<void>;
  showRewardedContinue: () => Promise<boolean>;
  adsReady: boolean;
  lastAdError: string | null;
};

const AdContext = createContext<AdContextValue | null>(null);

const MIN_SESSION_FOR_INTERSTITIAL_SEC = 12;
const INTERSTITIAL_COOLDOWN_MS = 45_000;

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [adsReady, setAdsReady] = useState(!adsSupportedOnPlatform());
  const [lastAdError, setLastAdError] = useState<string | null>(null);
  const lastInterstitialAt = useRef(0);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const rewardedRef = useRef<RewardedAd | null>(null);

  const loadInterstitial = useCallback(() => {
    if (!adsSupportedOnPlatform()) return;
    const ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
    interstitialRef.current = ad;
    ad.addAdEventListener(AdEventType.LOADED, () => setLastAdError(null));
    ad.addAdEventListener(AdEventType.ERROR, (e) => {
      setLastAdError(e.message ?? 'Interstitial failed');
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadInterstitial();
    });
    ad.load();
  }, []);

  const loadRewarded = useCallback(() => {
    if (!adsSupportedOnPlatform()) return;
    const ad = RewardedAd.createForAdRequest(AD_UNITS.rewarded);
    rewardedRef.current = ad;
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLastAdError(null));
    ad.addAdEventListener(AdEventType.ERROR, (e) => {
      setLastAdError(e.message ?? 'Rewarded failed');
    });
    ad.load();
  }, []);

  useEffect(() => {
    if (!adsSupportedOnPlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        await MobileAds().initialize();
        if (cancelled) return;
        setAdsReady(true);
        loadInterstitial();
        loadRewarded();
      } catch (e) {
        if (!cancelled) {
          setLastAdError(e instanceof Error ? e.message : 'Ads init failed');
          setAdsReady(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadInterstitial, loadRewarded]);

  const showInterstitialIfAllowed = useCallback(
    async (sessionSeconds: number) => {
      if (!adsSupportedOnPlatform() || !adsReady) return;
      if (sessionSeconds < MIN_SESSION_FOR_INTERSTITIAL_SEC) return;
      const now = Date.now();
      if (now - lastInterstitialAt.current < INTERSTITIAL_COOLDOWN_MS) return;
      const ad = interstitialRef.current;
      if (!ad?.loaded) return;
      lastInterstitialAt.current = now;
      await ad.show();
    },
    [adsReady],
  );

  const showRewardedContinue = useCallback(async (): Promise<boolean> => {
    if (!adsSupportedOnPlatform() || !adsReady) {
      return Platform.OS === 'web';
    }
    const ad = rewardedRef.current;
    if (!ad?.loaded) return false;

    return new Promise((resolve) => {
      let earned = false;
      const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        loadRewarded();
        resolve(earned);
      });
      ad.show().catch(() => {
        unsubEarned();
        unsubClosed();
        resolve(false);
      });
    });
  }, [adsReady, loadRewarded]);

  const value = useMemo(
    () => ({
      bannerUnitId: AD_UNITS.banner,
      showInterstitialIfAllowed,
      showRewardedContinue,
      adsReady,
      lastAdError,
    }),
    [showInterstitialIfAllowed, showRewardedContinue, adsReady, lastAdError],
  );

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds(): AdContextValue {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAds must be used within AdProvider');
  return ctx;
}

export function MenuBanner() {
  const { bannerUnitId, adsReady } = useAds();
  if (!adsSupportedOnPlatform() || !adsReady) return null;
  return (
    <BannerAd
      unitId={bannerUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAdsOnly: false }}
    />
  );
}
