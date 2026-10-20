import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function CatMascot({ size = 48 }: { size?: number }) {
  return (
    <View style={[styles.face, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.55 }]}>🐱</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  emoji: {
    marginTop: 2,
  },
});
