import { getVisibleChildren } from './visibleNodes.js';

export function computeSubtreeWeight(node, nodes, edges) {
  const { visibleChildren } = getVisibleChildren(nodes, edges, node.id);
  if (!visibleChildren.length) {
    return 1;
  }

  return Math.max(
    1,
    visibleChildren.reduce((sum, child) => sum + computeSubtreeWeight(child, nodes, edges), 0)
  );
}