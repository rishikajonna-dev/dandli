import React from 'react';

export function MoreBadge({ badge, count, dimmed = false, className = '', onClick }) {
  if (!count && !badge?.isExpanded) return null;

  const style = badge ? {
    width: badge.size.width,
    height: badge.size.height,
    transform: `translate(${badge.left}px, ${badge.top}px)`,
    opacity: dimmed ? 0.2 : 1
  } : undefined;

  return (
    <button
      type="button"
      className={`more-badge ${badge?.isExpanded ? 'expanded' : ''} ${className}`}
      style={style}
      aria-label={badge?.isExpanded ? 'Collapse hidden nodes' : `Show ${count} more hidden nodes`}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {badge?.isExpanded ? 'Collapse ↑' : `+${count} more ↓`}
    </button>
  );
}
