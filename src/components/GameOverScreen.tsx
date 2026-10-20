import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { AdBanner } from './AdBanner';

type Props = {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  canContinue: boolean;
  continueLoading: boolean;
  onContinue: () => void;
  onPlayAgain: () => void;
  onMenu: () => void;
};

function shareMessage(score: number, bestScore: number): string {
  return `I stacked ${score} blocks in Stack Rush! Can you beat my best of ${bestScore}?`;
}

export function GameOverScreen({
  score,
  bestScore,
  isNewBest,
  canContinue,
  continueLoading,
  onContinue,
  onPlayAgain,
  onMenu,
}: Props) {
  const handleShare = async () => {
    try {
      await Share.share({ message: shareMessage(score, bestScore) });
    } catch {
      // user dismissed
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.scoreLabel}>blocks stacked</Text>
        {isNewBest ? <Text style={styles.newBest}>New best score!</Text> : null}
        <Text style={styles.bestLine}>Best: {bestScore}</Text>
        <Text style={styles.shareLine}>{shareMessage(score, bestScore)}</Text>

        {canContinue ? (
          <Pressable
            style={[styles.button, styles.continueBtn]}
            onPress={onContinue}
            disabled={continueLoading}
            accessibilityRole="button"
          >
            {continueLoading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonTextDark}>Watch ad to continue (once)</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable style={styles.button} onPress={onPlayAgain} accessibilityRole="button">
          <Text style={styles.buttonTextDark}>Play again</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={handleShare} accessibilityRole="button">
          <Text style={styles.secondaryText}>Share score</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={onMenu} accessibilityRole="button">
          <Text style={styles.secondaryText}>Main menu</Text>
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
  panel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  title: {
    color: COLORS.textMuted,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  score: {
    color: COLORS.text,
    fontSize: 64,
    fontWeight: '800',
    marginTop: 4,
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  newBest: {
    color: COLORS.success,
    fontSize: 18,
    fontWeight: '700',
  },
  bestLine: {
    color: COLORS.accentAlt,
    fontSize: 17,
    fontWeight: '600',
  },
  shareLine: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: COLORS.accentAlt,
  },
  buttonTextDark: {
    color: COLORS.background,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
