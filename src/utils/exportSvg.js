import { computeRadialLayout } from '../layout/radialLayout.js';
import { branchPalette, rgba } from './colors.js';

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pathFor(connector) {
  const { source, target, axis } = connector;
  if (axis === 'x') {
    const delta = Math.abs(target.x - source.x);
    const control = Math.max(72, delta * 0.48);
    const sign = target.x >= source.x ? 1 : -1;
    return `M ${source.x} ${source.y} C ${source.x + control * sign} ${source.y}, ${target.x - control * sign} ${target.y}, ${target.x} ${target.y}`;
  }
  const delta = Math.abs(target.y - source.y);
  const control = Math.max(72, delta * 0.48);
  const sign = target.y >= source.y ? 1 : -1;
  return `M ${source.x} ${source.y} C ${source.x} ${source.y + control * sign}, ${target.x} ${target.y - control * sign}, ${target.x} ${target.y}`;
}

export function mapToSvg(map, state = {}) {
  const layout = computeRadialLayout(map.root, {
    palette: branchPalette,
    collapsedNodeIds: new Set(state.collapsedNodeIds ?? []),
    expandedOverflow: new Set(state.expandedOverflow ?? [])
  });
  const padding = 160;
  const width = layout.bounds.right - layout.bounds.left + padding * 2;
  const height = layout.bounds.bottom - layout.bounds.top + padding * 2;
  const viewBox = `${layout.bounds.left - padding} ${layout.bounds.top - padding} ${width} ${height}`;

  const connectors = layout.connectors.map((connector) => (
    `<path d="${pathFor(connector)}" stroke="${rgba(connector.branchColor, 0.48)}" stroke-width="2" stroke-linecap="round" fill="none" />`
  )).join('');

  const nodes = layout.nodes.map((node) => {
    const fill = node.depth === 0 ? '#242321' : rgba(node.branchColor, node.depth === 1 ? 0.16 : 0.11);
    const color = node.depth === 0 ? '#fffaf3' : '#252320';
    return `<g><rect x="${node.left}" y="${node.top}" width="${node.size.width}" height="${node.size.height}" rx="20" fill="${fill}" stroke="${rgba(node.branchColor, 0.32)}" /><text x="${node.x}" y="${node.y + 4}" text-anchor="middle" font-family="DM Sans, Arial" font-size="13" font-weight="700" fill="${color}">${escapeXml(node.label)}</text></g>`;
  }).join('');

  const badges = layout.overflowBadges.map((badge) => (
    `<g><rect x="${badge.left}" y="${badge.top}" width="${badge.size.width}" height="${badge.size.height}" rx="18" fill="${rgba(badge.branchColor, 0.09)}" stroke="${rgba(badge.branchColor, 0.32)}" stroke-dasharray="4 4" /><text x="${badge.x}" y="${badge.y + 4}" text-anchor="middle" font-family="DM Sans, Arial" font-size="12" font-weight="700" fill="${badge.branchColor}">+${badge.hiddenCount} more</text></g>`
  )).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}"><rect x="${layout.bounds.left - padding}" y="${layout.bounds.top - padding}" width="${width}" height="${height}" fill="#f6f2ea" />${connectors}${nodes}${badges}</svg>`;
}

export function exportSvg(map, state) {
  const svg = mapToSvg(map, state);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${map.title || 'clasp-map'}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}
