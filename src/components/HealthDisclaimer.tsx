import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';

type Props = {
  compact?: boolean;
};

export function HealthDisclaimer({ compact }: Props) {
  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <Text style={compact ? styles.compactText : styles.text}>
        BloomGrid is a wellness-themed puzzle game, not a medical device or health tracker.
        It does not diagnose, treat, or predict your cycle. Mood emoji logs stay on this device
        only. Talk to a clinician for medical questions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    padding: 14,
    backgroundColor: palette.lavender,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.lavenderDeep,
  },
  compactWrap: {
    marginTop: 12,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.ink,
  },
  compactText: {
    fontSize: 11,
    lineHeight: 16,
    color: palette.inkSoft,
    textAlign: 'center',
  },
});
