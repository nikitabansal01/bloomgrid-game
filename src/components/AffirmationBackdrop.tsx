import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { affirmations, palette } from '../theme/colors';

type Props = {
  active: boolean;
  intervalMs?: number;
};

export function AffirmationBackdrop({ active, intervalMs = 2400 }: Props) {
  const [index, setIndex] = useState(0);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % affirmations.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, [active, opacity]);

  if (!active) return null;

  const word = affirmations[index];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.Text style={[styles.bgWord, { opacity }]}>{word}</Animated.Text>
      <Text style={styles.label}>{word}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bgWord: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 72,
    fontWeight: '200',
    color: palette.lavenderDeep,
    letterSpacing: 4,
  },
  label: {
    position: 'absolute',
    top: '32%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: palette.ink,
    letterSpacing: 2,
  },
});
