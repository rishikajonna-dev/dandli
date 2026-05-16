import React from 'react';
import { branchPalette } from '../utils/colors.js';

export function ContextMenu({ menu, onClose, onAction }) {
  if (!menu) return null;

  return (
    <div className="context-menu" style={{ left: menu.x, top: menu.y }} onMouseLeave={onClose}>
      <button type="button" onClick={() => onAction('add')}>Add Child</button>
      <button type="button" onClick={() => onAction('rename')}>Rename</button>
      <button type="button" onClick={() => onAction('delete')}>Delete</button>
      <button type="button" onClick={() => onAction('collapse')}>Collapse/Expand</button>
      <button type="button" onClick={() => onAction('focus')}>Focus</button>
      <div className="color-row" aria-label="Change Color">
        {branchPalette.map((color) => (
          <button key={color} type="button" className="swatch" style={{ background: color }} onClick={() => onAction('color', color)} />
        ))}
      </div>
    </div>
  );
}
