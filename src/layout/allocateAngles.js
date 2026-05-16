import { minimumAngularSpan } from './geometry.js';

export function allocateAngles(children, weights, startAngle, endAngle, radius) {
  if (!children.length) return [];

  const span = Math.max(1, endAngle - startAngle);
  const minimums = children.map((child) => minimumAngularSpan(child, radius));
  const minimumTotal = minimums.reduce((sum, value) => sum + value, 0);
  const totalWeight = weights.reduce((sum, value) => sum + Math.max(1, value), 0) || children.length;

  let spans;
  if (minimumTotal <= span) {
    const leftover = span - minimumTotal;
    spans = children.map((_, index) => minimums[index] + leftover * (Math.max(1, weights[index]) / totalWeight));
  } else {
    spans = minimums.map((value) => (value / minimumTotal) * span);
  }

  let cursor = startAngle;
  return children.map((child, index) => {
    const childStart = cursor;
    const childEnd = index === children.length - 1 ? endAngle : cursor + spans[index];
    cursor = childEnd;
    return {
      node: child,
      startAngle: childStart,
      endAngle: childEnd,
      angle: (childStart + childEnd) / 2,
      compressed: minimumTotal > span
    };
  });
}
