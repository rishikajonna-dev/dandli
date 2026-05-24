import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="skeleton-container animate-pulse">
      {/* Hero skeleton */}
      <div className="skeleton-hero">
        <div className="skeleton-line skeleton-eyebrow"></div>
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-badge"></div>
        <div className="skeleton-cards">
          <div className="skeleton-card-large"></div>
          <div className="skeleton-card-large"></div>
        </div>
      </div>

      {/* Grid section skeleton */}
      <div className="skeleton-grid-section">
        <div className="skeleton-grid-header">
          <div className="skeleton-line skeleton-section-title"></div>
          <div className="skeleton-line skeleton-sort"></div>
        </div>
        
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-map-card">
              <div className="skeleton-map-thumb"></div>
              <div className="skeleton-map-title"></div>
              <div className="skeleton-map-meta"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
