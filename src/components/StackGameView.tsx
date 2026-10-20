import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';
import {
  BLOCK_HEIGHT,
  dropBlock,
  initialStack,
  movingWidthForScore,
  speedForScore,
} from '../game/stackEngine';
import type { RunSnapshot, StackBlock } from '../game/types';

type Props = {
  onGameOver: (payload: {
    score: number;
    snapshotBeforeMiss: RunSnapshot | null;
  }) => void;
  resumeFrom?: RunSnapshot | null;
  onRunStart?: () => void;
};

export function StackGameView({ onGameOver, resumeFrom, onRunStart }: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(screenWidth);
  const [stack, setStack] = useState<StackBlock[]>(() =>
    resumeFrom?.stack ?? initialStack(screenWidth),
  );
  const [score, setScore] = useState(resumeFrom?.score ?? 0);
  const [movingX, setMovingX] = useState(resumeFrom?.movingX ?? 0);
  const directionRef = useRef<1 | -1>(resumeFrom?.direction ?? 1);
  const speedRef = useRef(resumeFrom?.speed ?? speedForScore(0));
  const snapshotRef = useRef<RunSnapshot | null>(null);
  const startedRef = useRef(false);

  const playWidth = layoutWidth || screenWidth;
  const movingWidth = movingWidthForScore(playWidth, score);
  const cameraOffset = Math.max(0, (stack.length - 8) * BLOCK_HEIGHT);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      onRunStart?.();
    }
  }, [onRunStart]);

  useEffect(() => {
    speedRef.current = resumeFrom?.speed ?? speedForScore(score);
  }, [score, resumeFrom?.speed]);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setMovingX((prev) => {
        let next = prev + directionRef.current * speedRef.current;
        const maxX = playWidth - movingWidth;
        if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        } else if (next >= maxX) {
          next = maxX;
          directionRef.current = -1;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playWidth, movingWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setLayoutWidth(e.nativeEvent.layout.width);
  };

  const handleTap = useCallback(() => {
    snapshotRef.current = {
      stack: stack.map((b) => ({ ...b })),
      score,
      movingX,
      direction: directionRef.current,
      speed: speedRef.current,
    };

    const result = dropBlock(stack, movingX, movingWidth, score);
    if (!result.ok) {
      onGameOver({ score, snapshotBeforeMiss: snapshotRef.current });
      return;
    }

    void Haptics.impactAsync(
      result.perfect ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
    );

    setStack(result.stack);
    setScore(result.score);
    speedRef.current = speedForScore(result.score);
    setMovingX((playWidth - movingWidthForScore(playWidth, result.score)) / 2);
  }, [stack, movingX, movingWidth, score, onGameOver, playWidth]);

  const baseTop = screenHeight * 0.72;

  return (
    <Pressable style={styles.root} onPress={handleTap} onLayout={handleLayout}>
      <View style={styles.hud}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.hint}>Tap when the block lines up</Text>
      </View>

      <View style={[styles.playfield, { height: screenHeight * 0.75 }]}>
        {stack.map((block, index) => (
          <View
            key={`${index}-${block.x}-${block.width}`}
            style={[
              styles.block,
              {
                left: block.x,
                width: block.width,
                top: baseTop - index * BLOCK_HEIGHT - cameraOffset,
                backgroundColor: block.color,
                height: BLOCK_HEIGHT - 2,
              },
            ]}
          />
        ))}
        <View
          style={[
            styles.block,
            styles.moving,
            {
              left: movingX,
              width: movingWidth,
              top: baseTop - stack.length * BLOCK_HEIGHT - cameraOffset,
              backgroundColor: stack[stack.length - 1]?.color ?? COLORS.accent,
              height: BLOCK_HEIGHT - 2,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hud: {
    paddingTop: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '800',
  },
  hint: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 15,
  },
  playfield: {
    flex: 1,
    position: 'relative',
  },
  block: {
    position: 'absolute',
    borderRadius: 4,
  },
  moving: {
    opacity: 0.95,
    borderWidth: 2,
    borderColor: '#ffffff55',
  },
});
