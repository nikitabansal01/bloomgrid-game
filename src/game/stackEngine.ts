import { BLOCK_PALETTE } from '../constants/theme';
import type { StackBlock } from './types';

export const BLOCK_HEIGHT = 28;
export const MIN_OVERLAP = 4;

export function blockColor(index: number): string {
  return BLOCK_PALETTE[index % BLOCK_PALETTE.length];
}

export function initialStack(screenWidth: number): StackBlock[] {
  const width = screenWidth * 0.62;
  return [
    {
      x: (screenWidth - width) / 2,
      width,
      color: blockColor(0),
    },
  ];
}

export function speedForScore(score: number): number {
  return 2.4 + score * 0.08;
}

export type DropResult =
  | { ok: true; stack: StackBlock[]; score: number; perfect: boolean }
  | { ok: false };

export function dropBlock(
  stack: StackBlock[],
  movingX: number,
  movingWidth: number,
  score: number,
): DropResult {
  const top = stack[stack.length - 1];
  const left = Math.max(top.x, movingX);
  const right = Math.min(top.x + top.width, movingX + movingWidth);
  const overlap = right - left;

  if (overlap < MIN_OVERLAP) {
    return { ok: false };
  }

  const perfect =
    Math.abs(movingX - top.x) < 3 && Math.abs(movingWidth - top.width) < 3;

  const next: StackBlock = {
    x: left,
    width: overlap,
    color: blockColor(stack.length),
  };

  return {
    ok: true,
    stack: [...stack, next],
    score: score + 1,
    perfect,
  };
}

export function movingWidthForScore(screenWidth: number, score: number): number {
  const base = stackWidthForLayer(screenWidth, score);
  return base;
}

export function stackWidthForLayer(screenWidth: number, layerIndex: number): number {
  const initial = screenWidth * 0.62;
  if (layerIndex <= 0) return initial;
  return Math.max(screenWidth * 0.15, initial * Math.pow(0.98, layerIndex));
}
