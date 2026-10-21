import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { affirmations, palette } from '../theme/colors';

type Props = {
  intervalMs?: number;
};

/** Gently cycling affirmation word, laid out inline so it never overlaps surrounding content. */
export function AffirmationWord({ intervalMs = 2400 }: Props) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % affirmations.length);
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, opacity]);

  return (
    <Animated.Text
      style={[styles.word, { opacity }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Affirmation: ${affirmations[index]}`}
    >
      {affirmations[index]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  word: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '600',
    color: palette.plum,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
