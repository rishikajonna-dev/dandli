import React from 'react';
import { rgba } from '../utils/colors.js';

export function MoreBadge({ badge, count, dimmed = false, className = '', onClick }) {
  if (!count) return null;

  const style = badge ? {
    width: badge.size.width,
    height: badge.size.height,
    transform: `translate(${badge.left}px, ${badge.top}px)`,
    background: rgba(badge.branchColor, 0.09),
    borderColor: rgba(badge.branchColor, 0.32),
    color: rgba(badge.branchColor, 0.92),
    opacity: dimmed ? 0.2 : 1
  } : undefined;

  return (
    <button
      type="button"
      className={`more-badge ${className}`}
      style={style}
      aria-label={`Show ${count} more hidden nodes`}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      +{count} more
    </button>
  );
}
