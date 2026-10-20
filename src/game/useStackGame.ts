import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  GAME_WIDTH,
  INITIAL_BLOCK_WIDTH,
  LAYER_HEIGHT,
  MIN_OVERLAP_RATIO,
  PERFECT_RATIO,
} from '../theme';
import { blockColorForLayer } from './colors';
import type { GamePhase, PlacedBlock, RunStats } from './types';

const BASE_Y = 48;
const BASE_SPEED = 2.4;

function overlapWidth(aLeft: number, aWidth: number, bLeft: number, bWidth: number): number {
  const aRight = aLeft + aWidth;
  const bRight = bLeft + bWidth;
  const left = Math.max(aLeft, bLeft);
  const right = Math.min(aRight, bRight);
  return Math.max(0, right - left);
}

export type StackGameState = {
  phase: GamePhase;
  blocks: PlacedBlock[];
  moverX: number;
  moverWidth: number;
  moverY: number;
  direction: 1 | -1;
  layer: number;
  combo: number;
  stats: RunStats;
  continueUsed: boolean;
  lastMessage: string | null;
  cameraOffsetY: number;
};

const initialStats = (): RunStats => ({
  score: 0,
  perfects: 0,
  maxCombo: 0,
  sessionStartedAt: Date.now(),
});

function createInitialState(): StackGameState {
  const baseBlock: PlacedBlock = {
    id: 'base',
    x: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
    y: BASE_Y,
    width: INITIAL_BLOCK_WIDTH,
    color: blockColorForLayer(0),
    perfect: true,
  };
  return {
    phase: 'playing',
    blocks: [baseBlock],
    moverX: (GAME_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
    moverWidth: INITIAL_BLOCK_WIDTH,
    moverY: BASE_Y + LAYER_HEIGHT,
    direction: 1,
    layer: 1,
    combo: 0,
    stats: initialStats(),
    continueUsed: false,
    lastMessage: null,
    cameraOffsetY: 0,
  };
}

export function useStackGame() {
  const [state, setState] = useState<StackGameState>(() => createInitialState());
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;
      const speed = BASE_SPEED + prev.layer * 0.08;
      let nextX = prev.moverX + prev.direction * speed;
      let direction = prev.direction;
      const maxX = GAME_WIDTH - prev.moverWidth;
      if (nextX <= 0) {
        nextX = 0;
        direction = 1;
      } else if (nextX >= maxX) {
        nextX = maxX;
        direction = -1;
      }
      return { ...prev, moverX: nextX, direction };
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (state.phase === 'playing') {
      rafRef.current = requestAnimationFrame(tick);
      return stopLoop;
    }
    stopLoop();
    return undefined;
  }, [state.phase, tick, stopLoop]);

  const placeBlock = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;

      const top = prev.blocks[prev.blocks.length - 1];
      const overlap = overlapWidth(prev.moverX, prev.moverWidth, top.x, top.width);
      const ratio = overlap / prev.moverWidth;

      if (ratio < MIN_OVERLAP_RATIO) {
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return { ...prev, phase: 'gameover', lastMessage: 'Missed the stack!' };
      }

      const perfect = ratio >= PERFECT_RATIO;
      const newLeft = Math.max(prev.moverX, top.x);
      const newWidth = overlap;
      const newBlock: PlacedBlock = {
        id: `b-${prev.layer}`,
        x: newLeft,
        y: top.y + LAYER_HEIGHT,
        width: newWidth,
        color: blockColorForLayer(prev.layer),
        perfect,
      };

      const combo = perfect ? prev.combo + 1 : 0;
      const points = perfect ? 2 + Math.min(combo, 5) : 1;
      const perfects = perfect ? prev.stats.perfects + 1 : prev.stats.perfects;
      const score = prev.stats.score + points;
      const maxCombo = Math.max(prev.stats.maxCombo, combo);

      if (perfect && Platform.OS !== 'web') {
        void Haptics.impactAsync(
          combo >= 3 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
        );
      }

      const nextLayer = prev.layer + 1;
      const cameraOffsetY = Math.max(0, (nextLayer - 6) * LAYER_HEIGHT);

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        moverX: newLeft,
        moverWidth: newWidth,
        moverY: newBlock.y + LAYER_HEIGHT,
        layer: nextLayer,
        combo,
        stats: { ...prev.stats, score, perfects, maxCombo },
        lastMessage: perfect ? (combo >= 3 ? `${combo}x PERFECT!` : 'Perfect!') : 'Nice slice',
        cameraOffsetY,
      };
    });
  }, []);

  const resetRun = useCallback(() => {
    stopLoop();
    setState(createInitialState());
  }, [stopLoop]);

  const continueAfterAd = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'gameover' || prev.continueUsed) return prev;
      const trimmed = prev.blocks.slice(0, -1);
      if (trimmed.length === 0) return prev;
      const top = trimmed[trimmed.length - 1];
      return {
        ...prev,
        phase: 'playing',
        blocks: trimmed,
        moverX: top.x,
        moverWidth: top.width,
        moverY: top.y + LAYER_HEIGHT,
        layer: Math.max(1, prev.layer - 1),
        continueUsed: true,
        lastMessage: 'Second chance!',
        combo: 0,
      };
    });
  }, []);

  const sessionSeconds = useCallback(() => {
    return (Date.now() - stateRef.current.stats.sessionStartedAt) / 1000;
  }, []);

  return {
    state,
    placeBlock,
    resetRun,
    continueAfterAd,
    sessionSeconds,
  };
}
