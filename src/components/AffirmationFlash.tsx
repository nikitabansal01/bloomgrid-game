import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { AffirmationEvent } from '../game/useSudokuGame';
import { colors } from '../theme';

type Props = {
  event: AffirmationEvent | null;
  onDone: () => void;
};

export function AffirmationFlash({ event, onDone }: Props) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (!event) return;
    opacity.setValue(0);
    scale.setValue(0.92);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.timing(opacity, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDone();
    });
  }, [event, onDone, opacity, scale]);

  if (!event) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.word}>{event.word}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.accentDark,
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
