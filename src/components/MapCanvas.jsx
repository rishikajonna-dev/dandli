import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Focus, Plus, Trash2 } from 'lucide-react';
import { Connector } from './Connector.jsx';
import { NodeCard } from './NodeCard.jsx';
import { Breadcrumbs } from './Breadcrumbs.jsx';
import { MoreBadge } from './MoreBadge.jsx';
import { computeRadialLayout } from '../layout/radialLayout.js';
import { useZoomPan } from '../hooks/useZoomPan.js';
import { branchPalette } from '../utils/colors.js';

function cloneSubtree(node) {
  return {
    ...node,
    children: Array.isArray(node.children) ? node.children.map(cloneSubtree) : []
  };
}

function walkTree(node, visitor, parent = null) {
  visitor(node, parent);
  (node.children ?? []).forEach((child) => walkTree(child, visitor, node));
}

function findNode(root, id) {
  let found = null;
  walkTree(root, (node) => {
    if (node.id === id) found = node;
  });
  return found;
}

function pathToNode(root, id) {
  const path = [];

  function walk(node) {
    path.push(node);
    if (node.id === id) return true;
    for (const child of node.children ?? []) {
      if (walk(child)) return true;
    }
    path.pop();
    return false;
  }

  walk(root);
  return path;
}

function relationSets(root, selectedNodeId) {
  const ancestors = new Set(pathToNode(root, selectedNodeId).map((node) => node.id));
  const descendants = new Set();
  const selected = findNode(root, selectedNodeId);

  if (selected) {
    walkTree(selected, (node) => descendants.add(node.id));
  }

  return {
    highlighted: new Set([...ancestors, ...descendants]),
    ancestors,
    descendants
  };
}

export function MapCanvas({
  tree,
  selectedNodeId,
  setSelectedNodeId,
  focusNodeId,
  setFocusNodeId,
  editingNodeId,
  setEditingNodeId,
  collapsedNodeIds,
  setCollapsedNodeIds,
  expandedOverflow,
  setExpandedOverflow,
  readOnly = false,
  onToggleOverflow,
  onRenameNode,
  onAddChild,
  onDeleteNode,
  onContextMenu
}) {
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef(null);
  const zoomPan = useZoomPan({ zoom: 0.82, panX: 0, panY: 0 });

  const effectiveRoot = useMemo(() => {
    const focused = focusNodeId ? findNode(tree, focusNodeId) : null;
    return cloneSubtree(focused ?? tree);
  }, [focusNodeId, tree]);

  const layout = useMemo(() => {
    return computeRadialLayout(effectiveRoot, {
      palette: branchPalette,
      collapsedNodeIds,
      expandedOverflow
    });
  }, [collapsedNodeIds, effectiveRoot, expandedOverflow]);

  const selectedNodeExists = layout.byId.has(selectedNodeId);
  const activeSelectedId = selectedNodeExists ? selectedNodeId : null;
  const relations = useMemo(() => relationSets(effectiveRoot, activeSelectedId), [activeSelectedId, effectiveRoot]);
  const focusPath = useMemo(() => focusNodeId ? pathToNode(tree, focusNodeId) : [], [focusNodeId, tree]);
  const semanticZoomClass = zoomPan.zoom < 0.58 ? 'zoom-far' : zoomPan.zoom < 1.02 ? 'zoom-mid' : 'zoom-near';

  const canvasStyle = {
    transform: `translate(${zoomPan.panX}px, ${zoomPan.panY}px) scale(${zoomPan.zoom})`
  };
  const svgFrame = {
    left: layout.bounds.left - 260,
    top: layout.bounds.top - 260,
    width: layout.bounds.right - layout.bounds.left + 520,
    height: layout.bounds.bottom - layout.bounds.top + 520
  };
  const visibleBounds = useMemo(() => {
    const margin = 280;
    const width = viewportSize.width || 0;
    const height = viewportSize.height || 0;

    return {
      left: (-zoomPan.panX) / zoomPan.zoom - margin,
      right: (width - zoomPan.panX) / zoomPan.zoom + margin,
      top: (-zoomPan.panY) / zoomPan.zoom - margin,
      bottom: (height - zoomPan.panY) / zoomPan.zoom + margin
    };
  }, [viewportSize.height, viewportSize.width, zoomPan.panX, zoomPan.panY, zoomPan.zoom]);
  const visibleNodes = useMemo(() => layout.nodes.filter((node) => (
    node.right >= visibleBounds.left &&
    node.left <= visibleBounds.right &&
    node.bottom >= visibleBounds.top &&
    node.top <= visibleBounds.bottom
  )), [layout.nodes, visibleBounds]);
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleConnectors = useMemo(() => layout.connectors.filter((connector) => (
    visibleNodeIds.has(connector.sourceId) || visibleNodeIds.has(connector.targetId)
  )), [layout.connectors, visibleNodeIds]);
  const visibleOverflowBadges = useMemo(() => layout.overflowBadges.filter((badge) => (
    badge.left + badge.size.width >= visibleBounds.left &&
    badge.left <= visibleBounds.right &&
    badge.top + badge.size.height >= visibleBounds.top &&
    badge.top <= visibleBounds.bottom
  )), [layout.overflowBadges, visibleBounds]);

  const pointerStartRef = useRef({ x: 0, y: 0 });

  function handlePointerDown(event) {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  }

  function handleViewportClick(event) {
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) return;
    selectNode(null);
  }

  function centerView() {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomPan.setPan({ x: rect.width / 2, y: rect.height / 2 });
  }

  useLayoutEffect(() => {
    centerView();
  }, []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    function syncSize() {
      const rect = viewport.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    }

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function zoomIn() {
      zoomPan.zoomIn();
    }

    function zoomOut() {
      zoomPan.zoomOut();
    }

    function fit() {
      centerView();
    }

    window.addEventListener('clasp-zoom-in', zoomIn);
    window.addEventListener('clasp-zoom-out', zoomOut);
    window.addEventListener('clasp-fit', fit);

    return () => {
      window.removeEventListener('clasp-zoom-in', zoomIn);
      window.removeEventListener('clasp-zoom-out', zoomOut);
      window.removeEventListener('clasp-fit', fit);
    };
  }, [zoomPan]);

  function selectNode(id) {
    setSelectedNodeId(id);
    setEditingNodeId(null);
  }

  function toggleCollapse(id) {
    setCollapsedNodeIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setExpandedOverflow((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function saveEdit(id, label) {
    if (readOnly) return;
    onRenameNode(id, label);
    setEditingNodeId(null);
  }

  function addChildToSelected() {
    if (readOnly) return;
    const parent = findNode(tree, activeSelectedId);
    if (!parent || layout.byId.get(activeSelectedId)?.isCollapsedIndicator) return;

    const childId = `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const childNode = {
      id: childId,
      label: 'New idea',
      children: [],
      collapsed: false,
      color: null,
      metadata: {}
    };

    onAddChild(activeSelectedId, childNode);
  }

  function deleteSelected() {
    if (readOnly) return;
    if (activeSelectedId === tree.id) return;
    onDeleteNode(activeSelectedId);
    requestAnimationFrame(centerView);
  }

  function focusSelected() {
    const nextFocus = findNode(tree, activeSelectedId);
    if (!nextFocus || nextFocus.id === tree.id) {
      setFocusNodeId(null);
      setSelectedNodeId(tree.id);
      return;
    }
    setFocusNodeId(nextFocus.id);
    setSelectedNodeId(nextFocus.id);
    requestAnimationFrame(centerView);
  }

  function navigateFocus(id) {
    setFocusNodeId(id === tree.id ? null : id);
    setSelectedNodeId(id);
    requestAnimationFrame(centerView);
  }

  return (
    <section className={`map-canvas ${semanticZoomClass} ${activeSelectedId ? 'has-selection' : ''}`} aria-label="CLASP mind map">
      <div className="canvas-toolbar">
        {!readOnly && (
          <>
            <button type="button" className="tool-button" onClick={addChildToSelected} disabled={!activeSelectedId} title="Add child node" aria-label="Add child node">
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="tool-button danger"
              onClick={deleteSelected}
              disabled={!activeSelectedId || activeSelectedId === tree.id}
              title="Delete selected node"
              aria-label="Delete selected node"
            >
              <Trash2 size={16} />
            </button>
            <span className="tool-divider" />
          </>
        )}
        <button type="button" className="tool-button" onClick={focusSelected} disabled={!activeSelectedId} title="Focus selected branch" aria-label="Focus selected branch">
          <Focus size={16} />
        </button>
        <button type="button" className="tool-button" onClick={() => {
          setFocusNodeId(null);
          setSelectedNodeId(tree.id);
          requestAnimationFrame(centerView);
        }} title="Return to root" aria-label="Return to root">
          <Crosshair size={16} />
        </button>
      </div>

      {focusNodeId && (
        <div className="breadcrumb-panel">
          <Breadcrumbs path={focusPath} onNavigate={navigateFocus} />
        </div>
      )}

      <div
        ref={viewportRef}
        className={`canvas-viewport ${zoomPan.isPanning ? 'is-panning' : ''}`}
        {...zoomPan.handlers}
        onPointerDown={(event) => {
          handlePointerDown(event);
          zoomPan.handlers.onPointerDown(event);
        }}
        onClick={handleViewportClick}
      >
        <div className="canvas-world" style={canvasStyle}>
          <svg
            className="connector-layer"
            style={svgFrame}
            viewBox={`${svgFrame.left} ${svgFrame.top} ${svgFrame.width} ${svgFrame.height}`}
          >
            {visibleConnectors.map((connector) => {
              const strong = relations.highlighted.has(connector.sourceId) && relations.highlighted.has(connector.targetId);
              const dimmed = activeSelectedId && !strong;
              return (
                <Connector
                  key={connector.id}
                  connector={connector}
                  emphasis={strong ? 'strong' : dimmed ? 'dimmed' : 'normal'}
                />
              );
            })}
          </svg>

          <div className="node-layer">
            {visibleOverflowBadges.map((badge) => {
              const parentHighlighted = relations.highlighted.has(badge.parentId);
              const dimmed = activeSelectedId && !parentHighlighted;

              return (
                <MoreBadge
                  key={badge.id}
                  badge={badge}
                  count={badge.hiddenCount}
                  dimmed={dimmed}
                  onClick={() => onToggleOverflow(badge.parentId)}
                />
              );
            })}

            {visibleNodes.map((layoutNode) => {
              const selected = layoutNode.id === activeSelectedId;
              const isConnected = (relations.ancestors.has(layoutNode.id) || relations.descendants.has(layoutNode.id)) && !selected;
              const dimmedConnected = activeSelectedId ? isConnected : false;
              const dimmedUnrelated = activeSelectedId ? (!selected && !isConnected) : false;

              if (activeSelectedId) {
                console.log(`[Node Focus Audit] Node ID: ${layoutNode.id} | Label: "${layoutNode.label}" | Selected: ${selected} | DimmedConnected: ${dimmedConnected} | DimmedUnrelated: ${dimmedUnrelated}`);
              }

              return (
                <NodeCard
                  key={layoutNode.id}
                  layoutNode={layoutNode}
                  selected={selected}
                  hovered={hoveredNodeId === layoutNode.id}
                  highlighted={!selected && isConnected}
                  dimmed={activeSelectedId && !selected}
                  dimmedConnected={dimmedConnected}
                  dimmedUnrelated={dimmedUnrelated}
                  editing={editingNodeId === layoutNode.id}
                  zoom={zoomPan.zoom}
                  collapsed={collapsedNodeIds.has(layoutNode.id)}
                  onSelect={selectNode}
                  onHover={setHoveredNodeId}
                  onEditStart={setEditingNodeId}
                  onEditSave={saveEdit}
                  onEditCancel={() => setEditingNodeId(null)}
                  onToggleCollapse={toggleCollapse}
                  onContextMenu={onContextMenu}
                />
              );
            })}
          </div>
        </div>
      </div>

      {!readOnly && (!tree.children || tree.children.length === 0) && (
        <div className="canvas-onboarding-hint">
          <div className="onboarding-hint-card">
            <h4>Start with one thought.</h4>
            <p>
              Press <span className="onboarding-hint-plus">+</span> to create a branch and start mapping your thinking.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
