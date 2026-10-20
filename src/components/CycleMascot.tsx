import React from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '../theme/colors';

type Props = {
  mood?: 'idle' | 'happy' | 'celebrate';
  size?: number;
};

/** Abstract cycle mark: ring + phase dots + soft crescent — no emoji, no characters. */
export function CycleMascot({ mood = 'idle', size = 56 }: Props) {
  const scale = size / 56;
  const ring = size * 0.92;
  const dot = Math.max(4, 6 * scale);
  const celebrate = mood === 'celebrate';

  return (
    <View
      style={[styles.wrap, { width: size + 16, height: size + 16 }]}
      accessibilityLabel="BloomGrid cycle mark"
      accessibilityRole="image"
    >
      <View
        style={[
          styles.ring,
          {
            width: ring,
            height: ring,
            borderRadius: ring / 2,
            borderWidth: Math.max(2, 2.5 * scale),
          },
        ]}
      />
      {PHASE_ANGLES.map((deg, i) => (
        <View
          key={deg}
          style={[
            styles.phaseDot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: PHASE_COLORS[i],
              transform: [
                { translateX: Math.cos((deg * Math.PI) / 180) * (ring * 0.38) },
                { translateY: Math.sin((deg * Math.PI) / 180) * (ring * 0.38) },
              ],
              opacity: mood === 'idle' && i === 3 ? 0.45 : 1,
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.crescent,
          {
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            backgroundColor: palette.lavenderDeep,
            transform: [{ translateX: size * 0.06 }],
          },
        ]}
      />
      <View
        style={[
          styles.crescentCut,
          {
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size * 0.14,
            backgroundColor: palette.blush,
            transform: [{ translateX: size * 0.12 }],
          },
        ]}
      />
      <View
        style={[
          styles.droplet,
          {
            width: size * 0.12,
            height: size * 0.16,
            borderTopLeftRadius: size * 0.08,
            borderTopRightRadius: size * 0.08,
            borderBottomLeftRadius: size * 0.06,
            borderBottomRightRadius: size * 0.06,
            bottom: size * 0.22,
          },
        ]}
      />
      {celebrate ? (
        <>
          <View style={[styles.spark, styles.sparkA, { width: 4 * scale, height: 4 * scale }]} />
          <View style={[styles.spark, styles.sparkB, { width: 3 * scale, height: 3 * scale }]} />
          <View style={[styles.spark, styles.sparkC, { width: 3 * scale, height: 3 * scale }]} />
        </>
      ) : null}
    </View>
  );
}

const PHASE_ANGLES = [-90, 0, 90, 180] as const;
const PHASE_COLORS = [palette.sageDeep, palette.lavenderDeep, palette.blushDeep, palette.sage] as const;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blush,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: palette.blushDeep,
  },
  ring: {
    position: 'absolute',
    borderColor: palette.lavenderDeep,
    opacity: 0.35,
  },
  phaseDot: {
    position: 'absolute',
  },
  crescent: {
    position: 'absolute',
    opacity: 0.85,
  },
  crescentCut: {
    position: 'absolute',
    opacity: 0.95,
  },
  droplet: {
    position: 'absolute',
    backgroundColor: palette.blushDeep,
    opacity: 0.55,
  },
  spark: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: palette.sageDeep,
    opacity: 0.7,
  },
  sparkA: {
    top: 6,
    right: 10,
  },
  sparkB: {
    top: 14,
    left: 8,
  },
  sparkC: {
    bottom: 10,
    right: 14,
  },
});
