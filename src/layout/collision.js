import { estimateNodeWidth } from './geometry.js';

const NODE_HEIGHT = 64;
const NODE_PADDING = 12;

export function getNodeBounds(node) {
  const width = estimateNodeWidth(node);
  return {
    left: node.position.x - NODE_PADDING,
    top: node.position.y - NODE_PADDING,
    right: node.position.x + width + NODE_PADDING,
    bottom: node.position.y + NODE_HEIGHT + NODE_PADDING
  };
}

export function getSubtreeBounds(positioned, rootId, edges) {
  const subtreeIds = new Set([rootId]);

  function collect(parentId) {
    edges
      .filter((edge) => edge.source === parentId)
      .forEach((edge) => {
        subtreeIds.add(edge.target);
        collect(edge.target);
      });
  }

  collect(rootId);

  let bounds = null;
  subtreeIds.forEach((id) => {
    const node = positioned.get(id);
    if (!node) return;
    const nodeBounds = getNodeBounds(node);
    bounds = bounds
      ? {
          left: Math.min(bounds.left, nodeBounds.left),
          top: Math.min(bounds.top, nodeBounds.top),
          right: Math.max(bounds.right, nodeBounds.right),
          bottom: Math.max(bounds.bottom, nodeBounds.bottom)
        }
      : nodeBounds;
  });

  return bounds;
}

export function translateSubtree(positioned, rootId, edges, delta) {
  const subtreeIds = new Set([rootId]);

  function collect(parentId) {
    edges
      .filter((edge) => edge.source === parentId)
      .forEach((edge) => {
        subtreeIds.add(edge.target);
        collect(edge.target);
      });
  }

  collect(rootId);

  subtreeIds.forEach((id) => {
    const node = positioned.get(id);
    if (!node) return;
    positioned.set(id, {
      ...node,
      position: {
        x: node.position.x + delta.x,
        y: node.position.y + delta.y
      }
    });
  });
}

export function rectanglesOverlap(a, b) {
  if (!a || !b) return false;
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function countOverlaps(bounds, siblings) {
  return siblings.filter((sibling) => rectanglesOverlap(bounds, sibling)).length;
}