import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AdEventType,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  MobileAds,
} from 'react-native-google-mobile-ads';
import { AD_UNITS, adsSupportedOnPlatform } from './adUnits';
type AdContextValue = {
  bannerUnitId: string;
  showInterstitialIfAllowed: (sessionSeconds: number) => Promise<void>;
  adsReady: boolean;
  lastAdError: string | null;
};

const AdContext = createContext<AdContextValue | null>(null);

const MIN_SESSION_FOR_INTERSTITIAL_SEC = 45;
const INTERSTITIAL_COOLDOWN_MS = 60_000;

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [adsReady, setAdsReady] = useState(!adsSupportedOnPlatform());
  const [lastAdError, setLastAdError] = useState<string | null>(null);
  const lastInterstitialAt = useRef(0);
  const interstitialRef = useRef<InterstitialAd | null>(null);

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

  useEffect(() => {
    if (!adsSupportedOnPlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        await MobileAds().initialize();
        if (cancelled) return;
        setAdsReady(true);
        loadInterstitial();
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
  }, [loadInterstitial]);

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

  const value = useMemo(
    () => ({
      bannerUnitId: AD_UNITS.banner,
      showInterstitialIfAllowed,
      adsReady,
      lastAdError,
    }),
    [showInterstitialIfAllowed, adsReady, lastAdError],
  );

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds(): AdContextValue {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAds must be used within AdProvider');
  return ctx;
}

/** Banner for home/menu only — never shown on the puzzle grid. */
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
