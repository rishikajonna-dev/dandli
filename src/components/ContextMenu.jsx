import React from 'react';
import { branchPalette } from '../utils/colors.js';

export function ContextMenu({ menu, rootId, onClose, onAction }) {
  if (!menu) return null;

  return (
    <div className="context-menu" role="menu" style={{ left: menu.x, top: menu.y }} onMouseLeave={onClose}>
      <button type="button" role="menuitem" onClick={() => onAction('add')}>Add Child</button>
      {menu.nodeId !== rootId && (
        <button type="button" role="menuitem" onClick={() => onAction('sibling')}>Add Sibling</button>
      )}
      <button type="button" role="menuitem" onClick={() => onAction('rename')}>Rename</button>
      <button type="button" role="menuitem" onClick={() => onAction('delete')}>Delete</button>
      <button type="button" role="menuitem" onClick={() => onAction('collapse')}>Collapse/Expand</button>
      <button type="button" role="menuitem" onClick={() => onAction('focus')}>Focus</button>
      <div className="color-row" aria-label="Change Color">
        {branchPalette.map((color) => (
          <button key={color} type="button" className="swatch" style={{ background: color }} aria-label={`Change color to ${color}`} onClick={() => onAction('color', color)} />
        ))}
      </div>
    </div>
  );
}
