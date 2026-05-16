import React from 'react';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ path, onNavigate }) {
  if (!path?.length) return null;

  return (
    <nav className="breadcrumbs" aria-label="Focus path">
      {path.map((node, index) => {
        const isLast = index === path.length - 1;

        return (
          <span key={node.id} className="crumb-wrap">
            {index > 0 && <ChevronRight size={14} />}
            <button type="button" className={isLast ? 'active' : ''} onClick={() => onNavigate(node.id)} disabled={isLast}>
              {node.label ?? node.title ?? node.text}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
