import React, { useEffect, useRef, useState } from 'react';

function nodeLabel(node) {
  return node.label ?? node.title ?? node.text ?? 'Untitled';
}

function OutlineItem({ node, depth, selectedId, collapsedNodeIds, readOnly, onSelect, onRename, onToggleCollapse }) {
  const ref = useRef(null);
  const [draft, setDraft] = useState(nodeLabel(node));
  const selected = selectedId === node.id;
  const collapsed = collapsedNodeIds.has(node.id);
  const hasChildren = (node.children ?? []).length > 0;

  useEffect(() => {
    setDraft(nodeLabel(node));
  }, [node]);

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const depthClass = depth === 0 ? 'is-root' : depth === 1 ? 'is-level-1' : 'is-level-deeper';

  return (
    <div className="outline-branch">
      <div
        ref={ref}
        className={`outline-item ${selected ? 'selected' : ''} ${depthClass}`}
      >
        <button
          type="button"
          className="outline-toggle"
          disabled={!hasChildren}
          onClick={() => onToggleCollapse(node.id)}
        >
          {hasChildren ? (collapsed ? '▸' : '▾') : ''}
        </button>
        <input
          value={draft}
          readOnly={readOnly}
          onFocus={() => onSelect(node.id)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => draft.trim() && onRename(node.id, draft.trim())}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              setDraft(nodeLabel(node));
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      {!collapsed && hasChildren && (
        <div className="outline-children">
          {(node.children ?? []).map((child) => (
            <OutlineItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              collapsedNodeIds={collapsedNodeIds}
              readOnly={readOnly}
              onSelect={onSelect}
              onRename={onRename}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OutlinePanel({ root, selectedId, collapsedNodeIds, readOnly, onSelect, onRename, onToggleCollapse }) {
  return (
    <aside className="outline-panel">
      <div className="outline-head">
        <p className="eyebrow">Live outline</p>
        <h2>{nodeLabel(root)}</h2>
      </div>
      <div className="outline-list">
        <OutlineItem
          node={root}
          depth={0}
          selectedId={selectedId}
          collapsedNodeIds={collapsedNodeIds}
          readOnly={readOnly}
          onSelect={onSelect}
          onRename={onRename}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
    </aside>
  );
}
