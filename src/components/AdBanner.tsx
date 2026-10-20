import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../constants/ads';
import { COLORS } from '../constants/theme';

type Props = {
  visible: boolean;
};

export function AdBanner({ visible }: Props) {
  if (!visible || Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.wrap} accessibilityLabel="Advertisement banner">
      <BannerAd unitId={AD_UNIT_IDS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
  },
});
