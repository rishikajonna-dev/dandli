export const layoutConstants = {
  rootRadius: 260,
  childDistance: 190,
  childDistancePerChild: 6,
  siblingGap: 18,
  maxVisibleChildren: 6
};

export const rootSlots = [
  { angle: 0, name: 'right' },
  { angle: 315, name: 'top-right' },
  { angle: 270, name: 'top' },
  { angle: 225, name: 'top-left' },
  { angle: 180, name: 'left' },
  { angle: 135, name: 'bottom-left' },
  { angle: 90, name: 'bottom' },
  { angle: 45, name: 'bottom-right' }
];

export function getNodeSize(depth) {
  if (depth === 0) return { width: 180, height: 72 };
  if (depth === 1) return { width: 130, height: 46 };
  if (depth === 2) return { width: 115, height: 40 };
  if (depth === 3) return { width: 105, height: 36 };
  return { width: 96, height: 34 };
}

function labelOf(node) {
  return node?.label ?? node?.title ?? node?.text ?? 'Untitled';
}

function toRadians(angle) {
  return (angle * Math.PI) / 180;
}

function vectorFromAngle(angle) {
  const radians = toRadians(angle);
  return {
    x: Math.round(Math.cos(radians) * 1000000) / 1000000,
    y: Math.round(Math.sin(radians) * 1000000) / 1000000
  };
}

function primaryAxis(direction) {
  return Math.abs(direction.x) >= Math.abs(direction.y) ? 'x' : 'y';
}

function sign(value) {
  return value < 0 ? -1 : 1;
}

function realChildren(node) {
  return Array.isArray(node?.children) ? node.children : [];
}

function isCollapsed(node, collapsedNodeIds) {
  return Boolean(node?.collapsed || collapsedNodeIds?.has(node?.id));
}

function normalizeNode(node, parentId = null) {
  return {
    id: String(node.id),
    label: labelOf(node),
    children: realChildren(node).map((child) => normalizeNode(child, String(node.id))),
    collapsed: Boolean(node.collapsed),
    color: node.color ?? null,
    metadata: node.metadata ?? {},
    parentId
  };
}

function normalizeOptions(options = {}) {
  return {
    ...options,
    collapsedNodeIds: options.collapsedNodeIds ?? new Set(),
    expandedOverflow: options.expandedOverflow ?? new Set(),
    constants: { ...layoutConstants, ...(options.constants ?? {}) }
  };
}

function childEntriesFor(node, options) {
  if (isCollapsed(node, options.collapsedNodeIds)) return [];

  const children = realChildren(node);
  const hiddenCount = Math.max(0, children.length - options.constants.maxVisibleChildren);
  const overflowExpanded = options.expandedOverflow.has(node.id);

  if (hiddenCount === 0 || overflowExpanded) return children;

  return [
    ...children.slice(0, options.constants.maxVisibleChildren),
    {
      id: `overflow-${node.id}`,
      parentId: node.id,
      hiddenCount,
      isOverflowBadge: true
    }
  ];
}

function measureEntry(entry, depth, direction, options) {
  if (entry.isOverflowBadge) return getNodeSize(depth);
  return measureSubtree(entry, depth, direction, options);
}

export function measureSubtree(node, depth = 0, direction = { x: 1, y: 0 }, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const size = getNodeSize(depth);
  const entries = childEntriesFor(node, normalizedOptions);

  if (!entries.length) {
    return { width: size.width, height: size.height };
  }

  const axis = primaryAxis(direction);
  const distance = normalizedOptions.constants.childDistance + entries.length * normalizedOptions.constants.childDistancePerChild;
  const childMeasures = entries.map((entry) => measureEntry(entry, depth + 1, direction, normalizedOptions));

  if (axis === 'x') {
    const stackedHeight = childMeasures.reduce((sum, measure) => sum + measure.height, 0) + normalizedOptions.constants.siblingGap * (childMeasures.length - 1);
    const childWidth = Math.max(...childMeasures.map((measure) => measure.width));

    return {
      width: size.width + distance + childWidth,
      height: Math.max(size.height, stackedHeight)
    };
  }

  const stackedWidth = childMeasures.reduce((sum, measure) => sum + measure.width, 0) + normalizedOptions.constants.siblingGap * (childMeasures.length - 1);
  const childHeight = Math.max(...childMeasures.map((measure) => measure.height));

  return {
    width: Math.max(size.width, stackedWidth),
    height: size.height + distance + childHeight
  };
}

function attachBounds(layoutNode) {
  const { width, height } = layoutNode.size;
  return {
    ...layoutNode,
    left: layoutNode.x - width / 2,
    right: layoutNode.x + width / 2,
    top: layoutNode.y - height / 2,
    bottom: layoutNode.y + height / 2
  };
}

function addNode(nodes, node, x, y, depth, direction, branchColor, slotName) {
  const size = getNodeSize(depth);
  const axis = primaryAxis(direction);
  const layoutNode = attachBounds({
    id: node.id,
    node,
    label: labelOf(node),
    x,
    y,
    depth,
    size,
    direction,
    axis,
    branchColor,
    slotName,
    childCount: realChildren(node).length,
    metadata: node.metadata ?? {}
  });
  nodes.push(layoutNode);
  return layoutNode;
}

function addOverflowBadge(overflowBadges, entry, parentLayout, x, y, depth, direction) {
  const size = getNodeSize(depth);
  overflowBadges.push({
    id: entry.id,
    parentId: entry.parentId,
    hiddenCount: entry.hiddenCount,
    x,
    y,
    left: x - size.width / 2,
    top: y - size.height / 2,
    size,
    branchColor: parentLayout.branchColor,
    direction,
    axis: primaryAxis(direction)
  });
}

function connectorPoints(parent, child) {
  const axis = child.axis;

  if (axis === 'x') {
    const xSign = sign(child.direction.x || child.x - parent.x || 1);
    return {
      source: { x: parent.x + (parent.size.width / 2) * xSign, y: parent.y },
      target: { x: child.x - (child.size.width / 2) * xSign, y: child.y },
      axis
    };
  }

  const ySign = sign(child.direction.y || child.y - parent.y || 1);
  return {
    source: { x: parent.x, y: parent.y + (parent.size.height / 2) * ySign },
    target: { x: child.x, y: child.y - (child.size.height / 2) * ySign },
    axis
  };
}

function layoutChildEntries(parentLayout, node, depth, direction, nodes, connectors, overflowBadges, options) {
  const entries = childEntriesFor(node, options);
  if (!entries.length) return;

  const axis = primaryAxis(direction);
  const distance = options.constants.childDistance + entries.length * options.constants.childDistancePerChild;
  const childMeasures = entries.map((entry) => measureEntry(entry, depth + 1, direction, options));
  const stackExtent = childMeasures.reduce((sum, measure) => {
    return sum + (axis === 'x' ? measure.height : measure.width);
  }, 0) + options.constants.siblingGap * (childMeasures.length - 1);

  let cursor = -stackExtent / 2;

  entries.forEach((entry, index) => {
    const measure = childMeasures[index];
    const childExtent = axis === 'x' ? measure.height : measure.width;
    const offset = cursor + childExtent / 2;
    const childX = axis === 'x'
      ? parentLayout.x + sign(direction.x) * distance
      : parentLayout.x + offset;
    const childY = axis === 'x'
      ? parentLayout.y + offset
      : parentLayout.y + sign(direction.y) * distance;

    if (entry.isOverflowBadge) {
      addOverflowBadge(overflowBadges, entry, parentLayout, childX, childY, depth + 1, direction);
      cursor += childExtent + options.constants.siblingGap;
      return;
    }

    const childLayout = addNode(nodes, entry, childX, childY, depth + 1, direction, parentLayout.branchColor, parentLayout.slotName);

    connectors.push({
      id: `${parentLayout.id}->${childLayout.id}`,
      sourceId: parentLayout.id,
      targetId: childLayout.id,
      branchColor: parentLayout.branchColor,
      ...connectorPoints(parentLayout, childLayout)
    });

    layoutDescendants(childLayout, entry, depth + 1, direction, nodes, connectors, overflowBadges, options);
    cursor += childExtent + options.constants.siblingGap;
  });
}

export function layoutDescendants(parentLayout, node, depth, direction, nodes, connectors, overflowBadges, options = {}) {
  layoutChildEntries(parentLayout, node, depth, direction, nodes, connectors, overflowBadges, normalizeOptions(options));
}

export function layoutRootChildren(rootLayout, root, nodes, connectors, overflowBadges, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const entries = childEntriesFor(root, normalizedOptions);
  const palette = normalizedOptions.palette ?? [];

  entries.forEach((entry, index) => {
    const slot = rootSlots[index % rootSlots.length];
    const direction = vectorFromAngle(slot.angle);
    const color = entry.color ?? palette[index % Math.max(1, palette.length)] ?? '#8B5CF6';
    const childX = rootLayout.x + direction.x * normalizedOptions.constants.rootRadius;
    const childY = rootLayout.y + direction.y * normalizedOptions.constants.rootRadius;

    if (entry.isOverflowBadge) {
      addOverflowBadge(overflowBadges, entry, rootLayout, childX, childY, 1, direction);
      return;
    }

    const childLayout = addNode(nodes, entry, childX, childY, 1, direction, color, slot.name);

    connectors.push({
      id: `${rootLayout.id}->${childLayout.id}`,
      sourceId: rootLayout.id,
      targetId: childLayout.id,
      branchColor: color,
      ...connectorPoints(rootLayout, childLayout)
    });

    layoutDescendants(childLayout, entry, 1, direction, nodes, connectors, overflowBadges, normalizedOptions);
  });
}

function computeBounds(nodes, overflowBadges) {
  return [...nodes, ...overflowBadges].reduce((bounds, item) => ({
    left: Math.min(bounds.left, item.left),
    right: Math.max(bounds.right, item.left + item.size.width),
    top: Math.min(bounds.top, item.top),
    bottom: Math.max(bounds.bottom, item.top + item.size.height)
  }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
}

export function computeRadialLayout(root, options = {}) {
  const normalizedRoot = normalizeNode(root);
  const normalizedOptions = normalizeOptions(options);
  const nodes = [];
  const connectors = [];
  const overflowBadges = [];
  const rootLayout = addNode(nodes, normalizedRoot, 0, 0, 0, { x: 1, y: 0 }, normalizedRoot.color ?? '#242321', 'root');

  layoutRootChildren(rootLayout, normalizedRoot, nodes, connectors, overflowBadges, normalizedOptions);

  const bounds = computeBounds(nodes, overflowBadges);
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return {
    root: rootLayout,
    nodes,
    connectors,
    overflowBadges,
    bounds,
    byId
  };
}
