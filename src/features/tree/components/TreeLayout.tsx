export const NODE_HEIGHT = 44;
export const COLUMN_GAP = 36;
export const ROW_GAP = 14;
export const CURVE_HEIGHT = 14;

const LEVEL_WIDTHS = [168, 248, 248, 340] as const;

export function nodeWidth(level: number): number {
  const index = Math.min(Math.max(level, 1), LEVEL_WIDTHS.length) - 1;
  return LEVEL_WIDTHS[index] as number;
}
