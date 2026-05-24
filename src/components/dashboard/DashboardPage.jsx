import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardHeader } from './DashboardHeader.jsx';
import { HeroSection } from './HeroSection.jsx';
import { RecentMapsSection } from './RecentMapsSection.jsx';
import { EmptyState } from './EmptyState.jsx';
import { LoadingSkeleton } from './LoadingSkeleton.jsx';
import { getUserMaps, createMap } from '../../features/maps/mapService.js';

// Count total nodes recursively in the mind map JSON structure
function countNodes(node) {
  if (!node) return 0;
  let count = 1;
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
}

// Convert ISO timestamp to a relative time string (e.g. "2 hours ago")
function getRelativeTimeString(dateString) {
  if (!dateString) return 'unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 60000) {
    return 'Just now';
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
}

export function DashboardPage({
  maps = [],
  userId,
  onOpenMap,
  onNewMap,
  onConvertNotes,
  onSyncMaps,
  onDeleteMap,
  onRenameMap,
  onSignOut
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('last-updated-desc');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal dialog states
  const [renamingMap, setRenamingMap] = useState(null);
  const [deletingMap, setDeletingMap] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // Fetch maps from Supabase and synchronize with the App history state
  const fetchMaps = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching maps...");
      const data = await getUserMaps(userId);
      console.log("Fetched maps:", data);
      if (onSyncMaps) {
        onSyncMaps(data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [onSyncMaps, userId]);

  // Load maps on initial mount
  useEffect(() => {
    fetchMaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute processed maps (mapping node counts/relative dates, filtering, and sorting)
  const processedMaps = useMemo(() => {
    let list = maps.map((map) => {
      const title = map.title || map.data?.title || 'Untitled Map';
      const rootNode = map.root || map.data?.root;
      const nodeCount = countNodes(rootNode);
      const timeStr = getRelativeTimeString(map.updatedAt || map.updated_at);
      
      return {
        ...map,
        title,
        nodeCount,
        timeString: timeStr,
        updatedAt: map.updatedAt || map.updated_at || new Date().toISOString()
      };
    });

    // Filter by search query in real time
    if (searchQuery.trim()) {
      list = list.filter((map) =>
        (map.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort list based on selected dropdown sorting criteria
    return list.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0);
      const dateB = new Date(b.updatedAt || 0);

      if (sortBy === 'last-updated-desc') return dateB - dateA;
      if (sortBy === 'last-updated-asc') return dateA - dateB;
      if (sortBy === 'alphabetical-az') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'alphabetical-za') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [maps, searchQuery, sortBy]);

  // Handle map rename confirm (calls the updateMap prop/service)
  const handleRenameConfirm = async () => {
    if (!renamingMap) return;
    setIsSyncing(true);
    try {
      if (onRenameMap) {
        await onRenameMap(renamingMap.id, newTitle);
      }
      setRenamingMap(null);
      await fetchMaps();
    } catch (err) {
      console.error('Error renaming map:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle map duplicate (clones the map structure and inserts as new map in Supabase)
  const handleDuplicateMap = async (mapToDuplicate) => {
    setIsSyncing(true);
    try {
      const fullMap = maps.find(m => m.id === mapToDuplicate.id);
      if (!fullMap) return;

      const generateId = () => crypto.randomUUID();
      const newTitle = `${fullMap.title} (Copy)`;
      
      const duplicatedMap = {
        ...fullMap,
        id: generateId(),
        title: newTitle,
        root: fullMap.root ? {
          ...fullMap.root,
          label: newTitle
        } : null,
        updatedAt: new Date().toISOString()
      };

      await createMap(userId, duplicatedMap);
      await fetchMaps();
    } catch (err) {
      console.error('Error duplicating map:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle map delete confirm (calls the deleteMap prop/service)
  const handleDeleteConfirm = async () => {
    if (!deletingMap) return;
    setIsSyncing(true);
    try {
      if (onDeleteMap) {
        await onDeleteMap(deletingMap.id);
      }
      setDeletingMap(null);
      await fetchMaps();
    } catch (err) {
      console.error('Error deleting map:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <DashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onConvertNotes={onConvertNotes}
          onNewMap={onNewMap}
          onSignOut={onSignOut}
        />
        <main className="dashboard-content">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-fade-in">
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onConvertNotes={onConvertNotes}
          onNewMap={onNewMap}
          onSignOut={onSignOut}
        />

      <main className="dashboard-content">
        <HeroSection
          mapCount={processedMaps.length}
          onNewMap={onNewMap}
          onConvertNotes={onConvertNotes}
          isSyncing={isSyncing}
        />

        {maps.length === 0 ? (
          <EmptyState onNewMap={onNewMap} onConvertNotes={onConvertNotes} />
        ) : processedMaps.length === 0 ? (
          <div className="dashboard-empty-state">
            <h3 className="empty-state-title">No matching maps found</h3>
            <p className="empty-state-subtitle">We couldn't find any maps matching "{searchQuery}". Try searching for something else.</p>
            <div className="empty-state-actions">
              <button type="button" className="empty-secondary-btn" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          <RecentMapsSection
            maps={processedMaps}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onOpenMap={onOpenMap}
            onRenameMap={(map) => {
              setRenamingMap(map);
              setNewTitle(map.title);
            }}
            onDuplicateMap={handleDuplicateMap}
            onDeleteMap={(map) => {
              setDeletingMap(map);
            }}
          />
        )}
      </main>

      {/* Rename Dialog Modal */}
      {renamingMap && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setRenamingMap(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Rename Mind Map</h2>
            <p>Enter a new title for your mind map.</p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter map title..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameConfirm();
                if (e.key === 'Escape') setRenamingMap(null);
              }}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => setRenamingMap(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={handleRenameConfirm}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMap && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setDeletingMap(null)}>
          <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Mind Map</h2>
            <p>
              Are you sure you want to delete "{deletingMap.title}"?<br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-action"
                onClick={() => setDeletingMap(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-action"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
