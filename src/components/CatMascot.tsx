import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme/colors';

type Props = {
  mood?: 'idle' | 'happy' | 'celebrate';
  size?: number;
};

export function CatMascot({ mood = 'idle', size = 56 }: Props) {
  const face = mood === 'celebrate' ? '😸' : mood === 'happy' ? '😺' : '🐱';
  return (
    <View style={[styles.wrap, { width: size + 16, height: size + 16 }]}>
      <Text style={[styles.emoji, { fontSize: size }]} accessibilityLabel="Bloom cat mascot">
        {face}
      </Text>
      <View style={styles.bow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.blush,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: palette.blushDeep,
  },
  emoji: {
    lineHeight: undefined,
  },
  bow: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.lavenderDeep,
    opacity: 0.6,
  },
});
