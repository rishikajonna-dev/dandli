import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { rgba } from '../utils/colors.js';

export const NodeCard = React.memo(function NodeCard({
  layoutNode,
  selected,
  hovered,
  highlighted,
  dimmed,
  editing,
  zoom,
  collapsed,
  onSelect,
  onHover,
  onEditStart,
  onEditSave,
  onEditCancel,
  onToggleCollapse,
  onContextMenu
}) {
  const [draft, setDraft] = useState(layoutNode.label);
  const inputRef = useRef(null);
  const showBadges = zoom >= 0.62;
  const showMetadata = zoom >= 1.05;
  const canCollapse = layoutNode.childCount > 0 && !layoutNode.isCollapsedIndicator;

  useEffect(() => {
    if (editing) {
      setDraft(layoutNode.label);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, layoutNode.label]);

  const style = {
    width: layoutNode.size.width,
    height: layoutNode.size.height,
    transform: `translate(${layoutNode.left}px, ${layoutNode.top}px)`,
    background: layoutNode.depth === 0 ? '#242321' : rgba(layoutNode.branchColor, layoutNode.depth === 1 ? 0.16 : 0.11),
    boxShadow: selected ? '0 10px 30px rgba(0,0,0,0.12)' : '0 6px 18px rgba(0,0,0,0.06)',
    opacity: dimmed ? 0.2 : 1,
    color: layoutNode.depth === 0 ? '#fffaf3' : '#252320',
    borderColor: selected || hovered || highlighted ? rgba(layoutNode.branchColor, 0.42) : 'rgba(33, 31, 28, 0.08)'
  };

  function commit() {
    const next = draft.trim();
    if (next) onEditSave(layoutNode.id, next);
    else onEditCancel();
  }

  return (
    <div
      data-node-card
      className={[
        'node-card',
        selected ? 'is-selected' : '',
        hovered ? 'is-hovered' : '',
        highlighted ? 'is-highlighted' : '',
        layoutNode.isCollapsedIndicator ? 'is-more' : ''
      ].filter(Boolean).join(' ')}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(layoutNode.id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!layoutNode.isCollapsedIndicator) onEditStart(layoutNode.id);
      }}
      onMouseEnter={() => onHover(layoutNode.id)}
      onMouseLeave={() => onHover(null)}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onContextMenu?.(layoutNode.id, event.clientX, event.clientY);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(layoutNode.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select ${layoutNode.label}`}
    >
      {canCollapse && (
        <button
          className="collapse-toggle"
          type="button"
          aria-label={collapsed ? 'Expand branch' : 'Collapse branch'}
          onClick={(event) => {
            event.stopPropagation();
            onToggleCollapse(layoutNode.id);
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        </button>
      )}

      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          className="node-edit"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') onEditCancel();
          }}
          onBlur={commit}
        />
      ) : (
        <span className="node-label">{layoutNode.label}</span>
      )}

      {showBadges && !layoutNode.isCollapsedIndicator && layoutNode.childCount > 0 && (
        <span className="node-count">{layoutNode.childCount}</span>
      )}

      {showMetadata && layoutNode.metadata?.status && (
        <span className="node-meta">{layoutNode.metadata.status}</span>
      )}
    </div>
  );
});
