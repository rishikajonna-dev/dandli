import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Focus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
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
    setCollapsedNodeIds((current) => {
      const next = new Set(current);
      next.delete(activeSelectedId);
      return next;
    });
    setSelectedNodeId(childId);
    setEditingNodeId(childId);
  }

  function deleteSelected() {
    if (readOnly) return;
    if (activeSelectedId === tree.id) return;
    onDeleteNode(activeSelectedId);
    setExpandedOverflow((current) => {
      const next = new Set(current);
      next.delete(activeSelectedId);
      return next;
    });
    setFocusNodeId(null);
    setSelectedNodeId(tree.id);
    setEditingNodeId(null);
    setCollapsedNodeIds((current) => {
      const next = new Set(current);
      next.delete(activeSelectedId);
      return next;
    });
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
    <section className={`map-canvas ${semanticZoomClass}`} aria-label="CLASP mind map">
      <div className="canvas-toolbar">
        {!readOnly && (
          <>
            <button type="button" className="tool-button" onClick={addChildToSelected} disabled={!activeSelectedId} title="Add child node">
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="tool-button danger"
              onClick={deleteSelected}
              disabled={!activeSelectedId || activeSelectedId === tree.id}
              title="Delete selected node"
            >
              <Trash2 size={16} />
            </button>
            <span className="tool-divider" />
          </>
        )}
        <button type="button" className="tool-button" onClick={focusSelected} disabled={!activeSelectedId} title="Focus selected branch">
          <Focus size={16} />
        </button>
        <button type="button" className="tool-button" onClick={() => {
          setFocusNodeId(null);
          setSelectedNodeId(tree.id);
          requestAnimationFrame(centerView);
        }} title="Return to root">
          <Crosshair size={16} />
        </button>
        <span className="tool-divider" />
        <button type="button" className="tool-button" onClick={zoomPan.zoomOut} title="Zoom out">
          <Minus size={16} />
        </button>
        <button type="button" className="tool-button" onClick={zoomPan.zoomIn} title="Zoom in">
          <Plus size={16} />
        </button>
        <button type="button" className="tool-button" onClick={zoomPan.reset} title="Reset view">
          <RotateCcw size={16} />
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
            {layout.connectors.map((connector) => {
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
            {layout.overflowBadges.map((badge) => {
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

            {layout.nodes.map((layoutNode) => {
              const selected = layoutNode.id === activeSelectedId;
              const highlighted = relations.highlighted.has(layoutNode.id);
              const dimmed = activeSelectedId && !highlighted;

              return (
                <NodeCard
                  key={layoutNode.id}
                  layoutNode={layoutNode}
                  selected={selected}
                  hovered={hoveredNodeId === layoutNode.id}
                  highlighted={highlighted}
                  dimmed={dimmed}
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
    </section>
  );
}
