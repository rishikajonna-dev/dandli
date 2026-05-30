export const branchPalette = [
  '#9CD4B0', // Sage Green (more saturated)
  '#F2B898', // Dusty Peach (more saturated)
  '#C8B8E8', // Soft Lavender (more saturated)
  '#E0C898', // Warm Sand (more saturated)
  '#B8D4E8', // Powder Blue (more saturated)
  '#E8B8C8', // Muted Rose (more saturated)
  '#A8D8A8', // Soft Mint (more saturated)
  '#E0D0B8'  // Cream (more saturated)
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
