import React, { useRef } from 'react';
import { FileDown, FileJson, FileText, Image, Maximize2, PanelRight, Plus, Redo2, Share2, Trash2, Undo2, Upload, ZoomIn, ZoomOut } from 'lucide-react';

export function Toolbar({
  autosaveStatus,
  outlineOpen,
  canUndo,
  canRedo,
  readOnly,
  selectedNodeId,
  rootId,
  onAddChild,
  onDelete,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFit,
  onToggleOutline,
  onExportJson,
  onExportSvg,
  onExportPng,
  onExportMarkdown,
  onImportJson,
  onShare
}) {
  const fileRef = useRef(null);

  return (
    <div className="workspace-toolbar">
      <span className={`save-status ${autosaveStatus.toLowerCase().replaceAll(' ', '-')}`}>{autosaveStatus}</span>
      {!readOnly && (
        <>
          <button type="button" title="Add child" aria-label="Add child" onClick={onAddChild} disabled={!selectedNodeId}><Plus size={16} /></button>
          <button type="button" title="Delete selected" aria-label="Delete selected" onClick={onDelete} disabled={!selectedNodeId || selectedNodeId === rootId}><Trash2 size={16} /></button>
          <span className="tool-divider" />
          <button type="button" title="Undo" aria-label="Undo" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></button>
          <button type="button" title="Redo" aria-label="Redo" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></button>
          <span className="tool-divider" />
        </>
      )}
      <button type="button" title="Zoom in" aria-label="Zoom in" onClick={onZoomIn}><ZoomIn size={16} /></button>
      <button type="button" title="Zoom out" aria-label="Zoom out" onClick={onZoomOut}><ZoomOut size={16} /></button>
      <button type="button" title="Fit to screen" aria-label="Fit to screen" onClick={onFit}><Maximize2 size={16} /></button>
      <button type="button" title={outlineOpen ? 'Hide outline' : 'Show outline'} aria-label={outlineOpen ? 'Hide outline' : 'Show outline'} onClick={onToggleOutline}><PanelRight size={16} /></button>
      <span className="tool-divider" />
      <button type="button" title="Export JSON" aria-label="Export JSON" onClick={onExportJson}><FileJson size={16} /></button>
      <button type="button" title="Export SVG" aria-label="Export SVG" onClick={onExportSvg}><FileDown size={16} /></button>
      <button type="button" title="Export PNG" aria-label="Export PNG" onClick={onExportPng}><Image size={16} /></button>
      <button type="button" title="Export Markdown" aria-label="Export Markdown" onClick={onExportMarkdown}><FileText size={16} /></button>
      {!readOnly && (
        <>
          <button type="button" title="Import JSON" aria-label="Import JSON" onClick={() => fileRef.current?.click()}><Upload size={16} /></button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportJson(file);
            event.target.value = '';
            }} />
        </>
      )}
      <button type="button" title="Share read-only link" aria-label="Share read-only link" onClick={onShare}><Share2 size={16} /></button>
    </div>
  );
}
