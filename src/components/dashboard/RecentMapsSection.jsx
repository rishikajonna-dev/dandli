import React, { useState } from 'react';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { MapCard } from './MapCard.jsx';

const SORT_OPTIONS = [
  { value: 'last-updated-desc', label: 'Last edited' },
  { value: 'last-updated-asc', label: 'Oldest first' },
  { value: 'alphabetical-az', label: 'A → Z' },
  { value: 'alphabetical-za', label: 'Z → A' },
];

export function RecentMapsSection({
  maps,
  sortBy,
  setSortBy,
  onOpenMap,
  onRenameMap,
  onDuplicateMap,
  onDeleteMap,
}) {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <section className="recent-maps-section">
      <div className="recent-maps-header">
        <h2 className="recent-maps-title">Recent Maps</h2>

        <div className="recent-maps-controls">
          <div className="sort-control">
            <span className="sort-label">Sort by</span>
            <div className="sort-select-wrapper">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="sort-chevron" />
            </div>
          </div>

          <div className="view-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className={`maps-grid ${viewMode === 'list' ? 'maps-grid--list' : ''}`}>
        {maps.map((map, i) => (
          <MapCard
            key={map.id}
            map={map}
            index={i}
            onOpen={onOpenMap}
            onRename={onRenameMap}
            onDuplicate={onDuplicateMap}
            onDelete={onDeleteMap}
          />
        ))}
      </div>
    </section>
  );
}