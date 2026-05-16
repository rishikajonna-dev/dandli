export const branchPalette = [
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  '#F97316',
  '#EC4899',
  '#F59E0B',
  '#84CC16',
  '#6366F1'
];

export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
