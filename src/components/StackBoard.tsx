import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StackGameState } from '../game/useStackGame';
import { colors, GAME_WIDTH, LAYER_HEIGHT } from '../theme';

const BOARD_HEIGHT = 420;

type Props = {
  state: StackGameState;
  onTap: () => void;
};

export function StackBoard({ state, onTap }: Props) {
  const { blocks, moverX, moverWidth, moverY, cameraOffsetY, phase, lastMessage } = state;

  return (
    <Pressable style={styles.wrap} onPress={onTap} disabled={phase !== 'playing'}>
      <View style={styles.board}>
        <View style={[styles.stackArea, { transform: [{ translateY: -cameraOffsetY }] }]}>
          {blocks.map((b) => (
            <View
              key={b.id}
              style={[
                styles.block,
                {
                  left: b.x,
                  top: BOARD_HEIGHT - b.y - LAYER_HEIGHT,
                  width: b.width,
                  height: LAYER_HEIGHT - 2,
                  backgroundColor: b.color,
                  borderColor: b.perfect ? colors.perfect : 'rgba(255,255,255,0.25)',
                },
              ]}
            />
          ))}
          {phase === 'playing' && (
            <View
              style={[
                styles.block,
                styles.mover,
                {
                  left: moverX,
                  top: BOARD_HEIGHT - moverY - LAYER_HEIGHT,
                  width: moverWidth,
                  height: LAYER_HEIGHT - 2,
                },
              ]}
            />
          )}
        </View>
        {lastMessage && phase === 'playing' && (
          <Text style={styles.floatMsg}>{lastMessage}</Text>
        )}
      </View>
      {phase === 'playing' && <Text style={styles.hint}>Tap to slice</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  board: {
    width: GAME_WIDTH + 24,
    height: BOARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,245,255,0.35)',
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  stackArea: {
    width: GAME_WIDTH,
    height: BOARD_HEIGHT,
    alignSelf: 'center',
    position: 'relative',
  },
  block: {
    position: 'absolute',
    borderRadius: 6,
    borderWidth: 2,
  },
  mover: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: colors.neonCyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  floatMsg: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    color: colors.neonYellow,
    fontWeight: '800',
    fontSize: 18,
    textShadowColor: colors.neonPink,
    textShadowRadius: 12,
  },
  hint: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 1,
  },
});
