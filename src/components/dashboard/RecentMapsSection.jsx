import React from 'react';
import { MapCard } from './MapCard.jsx';

export function RecentMapsSection({ maps, sortBy, setSortBy, onOpenMap, onRenameMap, onDuplicateMap, onDeleteMap }) {
  return (
    <div className="recent-maps-section">
      <div className="recent-maps-header">
        <h2 className="recent-maps-title">RECENT MAPS</h2>
        <div className="sort-select-wrapper">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Sort mind maps"
          >
            <option value="last-updated-desc">Newest First</option>
            <option value="last-updated-asc">Oldest First</option>
            <option value="alphabetical-az">Alphabetical A-Z</option>
            <option value="alphabetical-za">Alphabetical Z-A</option>
          </select>
        </div>
      </div>

      <div className="maps-grid-layout">
        {maps.map((map, index) => (
          <MapCard
            key={map.id}
            map={map}
            index={index}
            onOpen={onOpenMap}
            onRename={onRenameMap}
            onDuplicate={onDuplicateMap}
            onDelete={onDeleteMap}
          />
        ))}
      </div>
    </div>
  );
}
