import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardHeader } from './DashboardHeader.jsx';
import { HeroSection } from './HeroSection.jsx';
import { RecentMapsSection } from './RecentMapsSection.jsx';
import { EmptyState } from './EmptyState.jsx';

export function DashboardPage({
  maps = [],
  onNewMap,
  onConvertNotes,
  onOpenMap,
  onRenameMap,
  onDuplicateMap,
  onDeleteMap,
  onSignOut,
  isSyncing = false,
  onCreateMapFromTemplate,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('last-updated-desc');

  const filteredMaps = useMemo(() => {
    let result = [...maps].filter((m) => !m.isUnsavedTemplate);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.title?.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case 'last-updated-asc':
        result.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        break;
      case 'alphabetical-az':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'alphabetical-za':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      default:
        result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    return result;
  }, [maps, searchQuery, sortBy]);

  const hasResults = filteredMaps.length > 0;
  const isEmpty = maps.filter((m) => !m.isUnsavedTemplate).length === 0;

  return (
    <div className="dashboard-root">
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSignOut={onSignOut}
      />

      <main className="dashboard-main">
        <HeroSection
          mapCount={maps.length}
          onNewMap={onNewMap}
          onConvertNotes={onConvertNotes}
          isSyncing={isSyncing}
        />

        <div className="dashboard-content">
          {isEmpty ? (
            <EmptyState
              onNewMap={onNewMap}
              onConvertNotes={onConvertNotes}
              onCreateMapFromTemplate={onCreateMapFromTemplate}
            />
          ) : !hasResults ? (
            <div className="no-results">
              <p>No maps match "<strong>{searchQuery}</strong>"</p>
            </div>
          ) : (
            <RecentMapsSection
              maps={filteredMaps}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onOpenMap={onOpenMap}
              onRenameMap={onRenameMap}
              onDuplicateMap={onDuplicateMap}
              onDeleteMap={onDeleteMap}
            />
          )}
        </div>
      </main>
    </div>
  );
}