import { allocateAngles } from './allocateAngles.js';
import { countOverlaps, getNodeBounds, getSubtreeBounds, translateSubtree } from './collision.js';
import { computeSubtreeWeight } from './computeSubtreeWeight.js';
import { layoutAngle, layoutRadius, radiusForDepth, sideForAngle, vectorFromAngle, wedgeWidthForDepth } from './geometry.js';
import { getVisibleChildren } from './visibleNodes.js';
import { getSubtreeIds } from '../utils/tree.js';

const CENTER = { x: 520, y: 340 };

export function computeFocusLayout(map, focusedNodeId) {
  const focused = map.content.nodes.find((node) => node.id === focusedNodeId);
  if (!focused) return { nodes: [], edges: [], visibleIds: new Set() };

  const subtreeIds = getSubtreeIds(map.content.nodes, map.content.edges, focusedNodeId);
  const positioned = new Map();
  positioned.set(focusedNodeId, {
    ...focused,
    data: { ...focused.data, angle: 0, layout: { angle: 0, radius: 0 }, side: 'center' },
    position: CENTER
  });

  layoutChildren({
    map,
    parent: positioned.get(focusedNodeId),
    positioned,
    subtreeIds,
    depth: 1,
    startAngle: -90,
    endAngle: 270
  });

  const visibleIds = new Set(positioned.keys());
  return {
    nodes: map.content.nodes.filter((node) => visibleIds.has(node.id)).map((node) => positioned.get(node.id) || node),
    edges: map.content.edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    visibleIds
  };
}

function layoutChildren({ map, parent, positioned, subtreeIds, depth, startAngle, endAngle }) {
  const { visibleChildren } = getVisibleChildren(map.content.nodes, map.content.edges, parent.id);
  const children = visibleChildren.filter((child) => subtreeIds.has(child.id));
  if (!children.length) return;

  const baseRadius = radiusForDepth(depth);
  const weights = children.map((child) => computeSubtreeWeight(child, map.content.nodes, map.content.edges));
  const sectors = allocateAngles(children, weights, startAngle, endAngle, baseRadius);
  const acceptedBounds = [getNodeBounds(parent)];

  sectors.forEach((sector) => {
    const angle = layoutAngle(sector.node, sector.angle);
    const baseSectorRadius = layoutRadius(sector.node, sector.compressed ? baseRadius + 54 : baseRadius);
    let best = null;

    for (let attempt = 0; attempt <= 5; attempt += 1) {
      const trial = new Map(positioned);
      const radius = baseSectorRadius;
      const vector = vectorFromAngle(angle);
      const placed = {
        ...sector.node,
        data: { ...sector.node.data, angle, layout: { angle, radius }, side: sideForAngle(angle) },
        position: {
          x: parent.position.x + vector.x * radius,
          y: parent.position.y + vector.y * radius
        }
      };
      const childWedgeWidth = wedgeWidthForDepth(depth);

      trial.set(placed.id, placed);
      layoutChildren({
        map,
        parent: placed,
        positioned: trial,
        subtreeIds,
        depth: depth + 1,
        startAngle: angle - childWedgeWidth / 2,
        endAngle: angle + childWedgeWidth / 2
      });

      translateSubtree(trial, placed.id, map.content.edges, {
        x: vector.x * attempt * 40,
        y: vector.y * attempt * 40
      });
      const bounds = getSubtreeBounds(trial, placed.id, map.content.edges);
      const overlaps = countOverlaps(bounds, acceptedBounds);
      if (!best || overlaps <= best.overlaps) best = { positioned: trial, bounds, overlaps };
      if (overlaps === 0) break;
    }

    best.positioned.forEach((node, id) => positioned.set(id, node));
    acceptedBounds.push(best.bounds);
  });
}