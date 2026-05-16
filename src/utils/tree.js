export const ROOT_NODE_ID = 'node_root';

export function getNode(nodes, id) {
  return nodes.find((node) => node.id === id) || null;
}

export function getChildren(nodes, edges, parentId) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return edges
    .filter((edge) => edge.source === parentId)
    .map((edge) => byId.get(edge.target))
    .filter(Boolean);
}

export function getAncestorPath(nodes, targetId) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const path = [];
  let current = byId.get(targetId);
  const seen = new Set();

  while (current && !seen.has(current.id)) {
    path.unshift(current.id);
    seen.add(current.id);
    if (current.id === ROOT_NODE_ID) break;
    current = byId.get(current.data?.parentId);
  }

  if (path[0] !== ROOT_NODE_ID && byId.has(ROOT_NODE_ID)) {
    return [ROOT_NODE_ID, ...path.filter((id) => id !== ROOT_NODE_ID)];
  }

  return path;
}

export function getDescendants(id, edges) {
  const children = edges.filter((edge) => edge.source === id).map((edge) => edge.target);
  return children.flatMap((child) => [child, ...getDescendants(child, edges)]);
}

export function getSubtreeIds(nodes, edges, rootId) {
  const keep = new Set([rootId]);
  getDescendants(rootId, edges).forEach((id) => keep.add(id));
  return keep;
}

export function buildOutlineTree(nodes, edges, rootId = ROOT_NODE_ID, getVisibleMeta) {
  const root = getNode(nodes, rootId);
  if (!root) return [];

  function walk(node) {
    const meta = getVisibleMeta(node.id);
    return {
      id: node.id,
      label: node.data.label,
      colour: node.data.colour,
      hiddenCount: meta.hiddenCount,
      totalChildren: meta.totalChildren,
      children: meta.visibleChildren.map(walk)
    };
  }

  return [walk(root)];
}
