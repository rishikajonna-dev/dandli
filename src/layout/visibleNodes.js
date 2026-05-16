import { getChildren } from '../utils/tree.js';

export const VISIBLE_CHILD_LIMIT = 5;

export function getVisibleChildren(nodes, edges, parentId, limit = VISIBLE_CHILD_LIMIT) {
  const children = getChildren(nodes, edges, parentId);
  return {
    visibleChildren: children.slice(0, limit),
    hiddenCount: Math.max(0, children.length - limit),
    totalChildren: children.length
  };
}

export function collectVisibleGraph(nodes, edges, rootId, limit = VISIBLE_CHILD_LIMIT) {
  const visibleIds = new Set([rootId]);

  function walk(parentId) {
    const { visibleChildren } = getVisibleChildren(nodes, edges, parentId, limit);
    visibleChildren.forEach((child) => {
      visibleIds.add(child.id);
      walk(child.id);
    });
  }

  walk(rootId);

  return {
    nodes: nodes.filter((node) => visibleIds.has(node.id)),
    edges: edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    visibleIds
  };
}
