import React, { useRef } from 'react';
import { Download, FileDown, FileJson, Image, PanelRight, Plus, Redo2, Share2, Trash2, Undo2, Upload, ZoomIn, ZoomOut, FileText } from 'lucide-react';

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
          <button type="button" title="Add child" onClick={onAddChild} disabled={!selectedNodeId}><Plus size={16} /></button>
          <button type="button" title="Delete selected" onClick={onDelete} disabled={!selectedNodeId || selectedNodeId === rootId}><Trash2 size={16} /></button>
          <span className="tool-divider" />
          <button type="button" title="Undo" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></button>
          <button type="button" title="Redo" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></button>
          <span className="tool-divider" />
        </>
      )}
      <button type="button" title="Zoom in" onClick={onZoomIn}><ZoomIn size={16} /></button>
      <button type="button" title="Zoom out" onClick={onZoomOut}><ZoomOut size={16} /></button>
      <button type="button" title="Fit to screen" onClick={onFit}>0</button>
      <button type="button" title={outlineOpen ? 'Hide outline' : 'Show outline'} onClick={onToggleOutline}><PanelRight size={16} /></button>
      <span className="tool-divider" />
      <button type="button" title="Export JSON" onClick={onExportJson}><FileJson size={16} /></button>
      <button type="button" title="Export SVG" onClick={onExportSvg}><FileDown size={16} /></button>
      <button type="button" title="Export PNG" onClick={onExportPng}><Image size={16} /></button>
      <button type="button" title="Export Markdown" onClick={onExportMarkdown}><FileText size={16} /></button>
      {!readOnly && (
        <>
          <button type="button" title="Import JSON" onClick={() => fileRef.current?.click()}><Upload size={16} /></button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportJson(file);
            event.target.value = '';
            }} />
        </>
      )}
      <button type="button" title="Share read-only link" onClick={onShare}><Share2 size={16} /></button>
      <button type="button" title="Download" onClick={onExportJson}><Download size={16} /></button>
    </div>
  );
}
