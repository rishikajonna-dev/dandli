export const branchPalette = [
  '#7F9B72',
  '#9A7A4F',
  '#61766A',
  '#B08B6A',
  '#899C7C',
  '#787262',
  '#5E7658',
  '#8A6A52'
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
