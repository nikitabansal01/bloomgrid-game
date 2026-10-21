import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';

type AdContextValue = {
  bannerUnitId: string;
  showInterstitialIfAllowed: (sessionSeconds: number) => Promise<void>;
  adsReady: boolean;
  lastAdError: string | null;
};

const AdContext = createContext<AdContextValue | null>(null);

const stubValue: AdContextValue = {
  bannerUnitId: 'web-stub',
  showInterstitialIfAllowed: async () => {},
  adsReady: false,
  lastAdError: null,
};

export function AdProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => stubValue, []);
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds(): AdContextValue {
  const ctx = useContext(AdContext);
  if (!ctx) throw new Error('useAds must be used within AdProvider');
  return ctx;
}

export function MenuBanner() {
  return (
    <View style={styles.webStub} accessibilityLabel="Ad placeholder">
      <Text style={styles.webStubText}>Ads appear in iOS/Android store builds only</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webStub: {
    backgroundColor: palette.lavender,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: palette.lavenderDeep,
  },
  webStubText: {
    fontSize: 11,
    color: palette.inkSoft,
  },
});
