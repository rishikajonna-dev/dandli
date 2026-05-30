import React from 'react';
import { Image, Plus, Redo2, Share2, Trash2, Undo2 } from 'lucide-react';

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
  onToggleOutline,
  onExportPng,
  onExportMarkdown,
  onShare
}) {
  return (
    <div className='workspace-toolbar'>
      <span className={`save-status ${autosaveStatus.toLowerCase().replaceAll(' ', '-')}`}>{autosaveStatus}</span>
      {!readOnly && (
        <>
          <button type='button' title='Add child' aria-label='Add child' onClick={onAddChild} disabled={!selectedNodeId}><Plus size={16} /></button>
          <button type='button' title='Delete selected' aria-label='Delete selected' onClick={onDelete} disabled={!selectedNodeId || selectedNodeId === rootId}><Trash2 size={16} /></button>
          <span className='tool-divider' />
        </>
      )}
      <button type='button' title={outlineOpen ? 'Hide outline' : 'Show outline'} aria-label={outlineOpen ? 'Hide outline' : 'Show outline'} onClick={onToggleOutline}>
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='3' y='3' width='18' height='18' rx='2' />
          <path d='M9 3v18' />
        </svg>
      </button>
      <span className='tool-divider' />
      <button type='button' title='Export PNG' aria-label='Export PNG' onClick={onExportPng}><Image size={16} /></button>
      <button type='button' className='copy-markdown-btn' onClick={onExportMarkdown}>
        Copy as Markdown
      </button>
      <button type='button' title='Share read-only link' aria-label='Share read-only link' onClick={onShare}><Share2 size={16} /></button>
    </div>
  );
}
