import React, { createContext, useContext, useMemo } from 'react';
import { AD_UNITS } from './adUnits';

type AdContextValue = {
  bannerUnitId: string;
  showInterstitialIfAllowed: (sessionSeconds: number) => Promise<void>;
  showRewardedContinue: () => Promise<boolean>;
  adsReady: boolean;
  lastAdError: string | null;
};

const AdContext = createContext<AdContextValue | null>(null);

/** Web preview: ads are stubbed; use a dev build on device for real test ads. */
export function AdProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      bannerUnitId: AD_UNITS.banner,
      showInterstitialIfAllowed: async () => {},
      showRewardedContinue: async () => true,
      adsReady: false,
      lastAdError: null,
    }),
    [],
  );
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds(): AdContextValue {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAds must be used within AdProvider');
  return ctx;
}

export function MenuBanner() {
  return null;
}
