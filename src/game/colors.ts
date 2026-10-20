import { colors } from '../theme';

const PALETTE = [
  colors.neonPink,
  colors.neonCyan,
  colors.neonPurple,
  colors.neonYellow,
  '#22d3ee',
  '#fb7185',
];

export function blockColorForLayer(layer: number): string {
  return PALETTE[layer % PALETTE.length];
}
