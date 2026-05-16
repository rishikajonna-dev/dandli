export function angleForIndex(index, total) {
  if (total <= 1) return 0;
  return -90 + (index * 360) / total;
}

export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

export function layoutAngle(node, fallback = 0) {
  return node?.data?.layout?.angle ?? fallback;
}

export function layoutRadius(node, fallback) {
  return node?.data?.layout?.radius ?? fallback;
}

export function angleSpan(startAngle, endAngle) {
  return Math.max(0, endAngle - startAngle);
}

export function vectorFromAngle(angle) {
  const radians = (angle * Math.PI) / 180;
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function sideForAngle(angle) {
  const vector = vectorFromAngle(angle);
  if (vector.x < -0.28) return 'left';
  if (vector.y < -0.55) return 'top';
  if (vector.y > 0.55) return 'bottom';
  return 'right';
}

export function nodeAnchor(node, toward) {
  const center = { x: node.position.x + 64, y: node.position.y + 22 };
  const target = { x: toward.position.x + 64, y: toward.position.y + 22 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: center.x + (dx / length) * 62,
    y: center.y + (dy / length) * 22
  };
}

export function estimateNodeWidth(node) {
  const label = node?.data?.label || '';
  return Math.min(240, Math.max(120, label.length * 8 + 42));
}

export function radiusForDepth(depth) {
  return 220 + Math.max(0, depth - 1) * 40;
}

export function wedgeWidthForDepth(depth) {
  if (depth <= 1) return 120;
  if (depth === 2) return 90;
  return 70;
}

export function minimumAngularSpan(node, radius) {
  const width = estimateNodeWidth(node);
  const radians = width / Math.max(radius, 1);
  return Math.max(12, (radians * 180) / Math.PI + 6);
}

export function curveBetween(source, target) {
  const start = nodeAnchor(source, target);
  const end = nodeAnchor(target, source);
  const dx = end.x - start.x;
  const c1 = {
    x: start.x + dx * 0.35,
    y: start.y
  };
  const c2 = {
    x: end.x - dx * 0.35,
    y: end.y
  };
  return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
}