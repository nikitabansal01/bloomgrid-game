import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { AdBanner } from './AdBanner';

type Props = {
  bestScore: number;
  onPlay: () => void;
};

export function MenuScreen({ bestScore, onPlay }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Stack Rush</Text>
        <Text style={styles.title}>Tap. Stack. Rush.</Text>
        <Text style={styles.subtitle}>
          Time your taps to align each block. One bad cut ends the run — unless you earn a
          continue.
        </Text>
        {bestScore > 0 ? (
          <Text style={styles.best}>Best run: {bestScore}</Text>
        ) : null}
        <Pressable style={styles.button} onPress={onPlay} accessibilityRole="button">
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
      </View>
      <AdBanner visible />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
  },
  kicker: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 17,
    lineHeight: 24,
  },
  best: {
    marginTop: 8,
    color: COLORS.accentAlt,
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: '800',
  },
});
