import React, { useMemo, useState, useEffect } from 'react';
import { MapCanvas } from '../components/MapCanvas.jsx';
import { OutlinePanel } from '../components/OutlinePanel.jsx';
import { ContextMenu } from '../components/ContextMenu.jsx';
import { Toolbar } from '../components/Toolbar.jsx';
import { useAutosave } from '../hooks/useAutosave.js';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.js';
import { exportJson } from '../utils/exportJson.js';
import { importJsonFile } from '../utils/importJson.js';
import { exportSvg } from '../utils/exportSvg.js';
import { exportPng } from '../utils/exportPng.js';
import { exportMarkdown } from '../utils/exportMarkdown.js';
import { updateMap } from '../features/maps/mapService.js';
import { FREE_PLAN_LIMITS, isNodeCreationAllowed } from '../features/billing/entitlements.js';

function nodeLabel(node) {
  return node?.label ?? node?.title ?? node?.text ?? 'Untitled';
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

function renameNode(node, id, label) {
  if (node.id === id) return { ...node, label };
  return { ...node, children: (node.children ?? []).map((child) => renameNode(child, id, label)) };
}

function addChildNode(node, parentId, childNode) {
  if (node.id === parentId) {
    return { ...node, collapsed: false, children: [...(node.children ?? []), childNode] };
  }
  return { ...node, children: (node.children ?? []).map((child) => addChildNode(child, parentId, childNode)) };
}

function deleteNode(node, id) {
  return { ...node, children: (node.children ?? []).filter((child) => child.id !== id).map((child) => deleteNode(child, id)) };
}

function colorNode(node, id, color) {
  if (node.id === id) return { ...node, color };
  return { ...node, children: (node.children ?? []).map((child) => colorNode(child, id, color)) };
}

function countNodes(root) {
  let count = 0;
  walkTree(root, () => {
    count += 1;
  });
  return count;
}

function toSet(value) {
  return value instanceof Set ? value : new Set(value ?? []);
}

export function Workspace({
  appState,
  setAppState,
  replaceAppState,
  canUndo,
  canRedo,
  undo,
  redo,
  onBack,
  readOnly = false,
  userId,
  onUpgradeNeeded
}) {
  const map = appState.maps.find((item) => item.id === appState.activeMapId) ?? appState.maps[0];
  const selectedNodeId = appState.selectedNodeId !== undefined ? appState.selectedNodeId : map.root.id;
  const focusNodeId = appState.focusNodeId ?? null;
  const editingNodeId = appState.editingNodeId ?? null;
  const collapsedNodeIds = useMemo(() => toSet(appState.collapsedNodeIds), [appState.collapsedNodeIds]);
  const expandedOverflow = useMemo(() => toSet(appState.expandedOverflow), [appState.expandedOverflow]);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [menu, setMenu] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const autosaveStatus = useAutosave('clasp-autosave', appState);

  // Supabase Database autosave effect
  useEffect(() => {
    if (readOnly || !map?.id || !userId) return;
    
    // Determine if it's a UUID (local fallback IDs are not UUIDs)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(map.id);
    if (!isUuid) return;

    const timer = setTimeout(async () => {
      try {
        const mapToSave = {
          ...map,
          updatedAt: new Date().toISOString(),
        };

        await updateMap(userId, map.id, mapToSave);
      } catch (err) {
        console.error("Autosave to Supabase failed:", err);
      }
    }, 2000); // 2 seconds delay for debounce

    return () => clearTimeout(timer);
  }, [map, readOnly, userId]);

  function updateCurrentMap(updater) {
    setAppState((current) => ({
      ...current,
      maps: current.maps.map((item) => {
        if (item.id !== map.id) return item;
        const next = updater(item);
        return { ...next, updatedAt: new Date().toISOString() };
      })
    }));
  }

  function setSelectedNodeId(id) {
    replaceAppState((current) => ({ ...current, selectedNodeId: id }));
  }

  function setFocusNodeId(id) {
    replaceAppState((current) => ({ ...current, focusNodeId: id }));
  }

  function setEditingNodeId(id) {
    replaceAppState((current) => ({ ...current, editingNodeId: id }));
  }

  function setCollapsedNodeIds(updater) {
    setAppState((current) => {
      const next = typeof updater === 'function' ? updater(new Set(current.collapsedNodeIds ?? [])) : updater;
      return { ...current, collapsedNodeIds: [...next] };
    });
  }

  function setExpandedOverflow(updater) {
    setAppState((current) => {
      const next = typeof updater === 'function' ? updater(new Set(current.expandedOverflow ?? [])) : updater;
      return { ...current, expandedOverflow: [...next] };
    });
  }

  function rename(id, label) {
    if (readOnly) return;
    updateCurrentMap(currentMap => ({
      ...currentMap,
      root: renameNode(currentMap.root, id, label),
    }));
  }

  function addChild(parentId = selectedNodeId, childNode = null) {
    if (readOnly) return;
    if (!parentId) return;
    if (!isNodeCreationAllowed(appState.totalNodesLifetime ?? 0)) {
      onUpgradeNeeded?.(`Free plan includes ${FREE_PLAN_LIMITS.totalNodesLifetime} total nodes lifetime.`);
      return;
    }
    const child = childNode ?? { id: `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, label: 'New idea', children: [], collapsed: false, color: null, metadata: {} };
    updateCurrentMap((currentMap) => ({ ...currentMap, root: addChildNode(currentMap.root, parentId, child) }));
    replaceAppState((current) => ({
      ...current,
      totalNodesLifetime: (current.totalNodesLifetime ?? countNodes(map.root)) + 1,
      selectedNodeId: child.id,
      editingNodeId: child.id
    }));
  }

  function addSibling(nodeId = selectedNodeId) {
    if (readOnly) return;
    if (!nodeId || nodeId === map.root.id) return;
    let parent = null;
    walkTree(map.root, (node, parentNode) => {
      if (node.id === nodeId) parent = parentNode;
    });
    if (!parent) return;
    addChild(parent.id);
  }

  function deleteSelected(id = selectedNodeId) {
    if (readOnly || !id || id === map.root.id) return;
    updateCurrentMap((currentMap) => ({ ...currentMap, root: deleteNode(currentMap.root, id) }));
    replaceAppState((current) => ({ ...current, selectedNodeId: map.root.id, focusNodeId: null, editingNodeId: null }));
  }

  function toggleCollapse(id = selectedNodeId) {
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

  function toggleOverflow(id) {
    setExpandedOverflow((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeColor(id, color) {
    if (readOnly) return;
    updateCurrentMap((currentMap) => ({ ...currentMap, root: colorNode(currentMap.root, id, color) }));
  }

  function share() {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(map))));
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    navigator.clipboard?.writeText(url);
    window.history.replaceState(null, '', url);
  }

  function handleExportMarkdown() {
    const md = exportMarkdown(map);
    navigator.clipboard?.writeText(md).then(() => {
      setSuccessMessage('Markdown copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2500);
    }).catch(() => {
      alert('Failed to copy to clipboard.');
    });
  }

  function importMap(file) {
    importJsonFile(file).then((imported) => {
      setAppState((current) => ({ ...current, maps: [imported, ...current.maps], activeMapId: imported.id, selectedNodeId: imported.root.id }));
    }).catch(() => onUpgradeNeeded?.('Import failed. Choose a valid CLASP JSON map.'));
  }

  const shortcutActions = useMemo(() => ({
    addChild,
    addSibling,
    rename: () => setEditingNodeId(selectedNodeId),
    deleteNode: deleteSelected,
    toggleCollapse,
    escape: () => editingNodeId ? setEditingNodeId(null) : setSelectedNodeId(map.root.id),
    undo,
    redo,
    zoomIn: () => window.dispatchEvent(new CustomEvent('clasp-zoom-in')),
    zoomOut: () => window.dispatchEvent(new CustomEvent('clasp-zoom-out')),
    fit: () => window.dispatchEvent(new CustomEvent('clasp-fit'))
  }), [editingNodeId, redo, selectedNodeId, undo]);

  useKeyboardShortcuts(shortcutActions, true);

  function handleContextAction(action, color) {
    const id = menu?.nodeId ?? selectedNodeId;
    setMenu(null);
    if (action === 'add') addChild(id);
    if (action === 'sibling') addSibling(id);
    if (action === 'rename') setEditingNodeId(id);
    if (action === 'delete') deleteSelected(id);
    if (action === 'collapse') toggleCollapse(id);
    if (action === 'focus') setFocusNodeId(id);
    if (action === 'color') changeColor(id, color);
  }

  if (!map) return null;

  return (
    <div className="workspace">
      <header className="workspace-top">
        <button type="button" className="back-button" onClick={onBack}>CLASP</button>
        <div>
          <p className="eyebrow">{readOnly ? 'Read-only share' : 'Workspace'}</p>
          <h1>{typeof map.title === 'string' && map.title.trim() ? map.title : 'Untitled Map'}</h1>
        </div>
        <Toolbar
          autosaveStatus={readOnly ? 'Read only' : autosaveStatus}
          outlineOpen={outlineOpen}
          canUndo={canUndo}
          canRedo={canRedo}
          readOnly={readOnly}
          selectedNodeId={selectedNodeId}
          rootId={map.root.id}
          onAddChild={() => addChild()}
          onDelete={() => deleteSelected()}
          onUndo={undo}
          onRedo={redo}
          onZoomIn={() => window.dispatchEvent(new CustomEvent('clasp-zoom-in'))}
          onZoomOut={() => window.dispatchEvent(new CustomEvent('clasp-zoom-out'))}
          onFit={() => window.dispatchEvent(new CustomEvent('clasp-fit'))}
          onToggleOutline={() => setOutlineOpen((value) => !value)}
          onExportJson={() => exportJson(map)}
          onExportSvg={() => exportSvg(map, appState)}
          onExportPng={() => exportPng(map, appState)}
          onExportMarkdown={handleExportMarkdown}
          onImportJson={importMap}
          onShare={share}
        />
      </header>
      <div className={`workspace-body ${outlineOpen ? 'with-outline' : ''}`}>
        <MapCanvas
          tree={map.root}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          focusNodeId={focusNodeId}
          setFocusNodeId={setFocusNodeId}
          editingNodeId={editingNodeId}
          setEditingNodeId={setEditingNodeId}
          collapsedNodeIds={collapsedNodeIds}
          setCollapsedNodeIds={setCollapsedNodeIds}
          expandedOverflow={expandedOverflow}
          setExpandedOverflow={setExpandedOverflow}
          readOnly={readOnly}
          onToggleOverflow={toggleOverflow}
          onRenameNode={rename}
          onAddChild={addChild}
          onDeleteNode={deleteSelected}
          onContextMenu={(nodeId, x, y) => !readOnly && setMenu({ nodeId, x, y })}
        />
        {outlineOpen && (
          <OutlinePanel
            root={map.root}
            selectedId={selectedNodeId}
            collapsedNodeIds={collapsedNodeIds}
            readOnly={readOnly}
            onSelect={setSelectedNodeId}
            onRename={rename}
            onToggleCollapse={toggleCollapse}
          />
        )}
      </div>
      <ContextMenu menu={menu} rootId={map.root.id} onClose={() => setMenu(null)} onAction={handleContextAction} />
      {successMessage && (
        <div className="toast" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}
    </div>
  );
}
