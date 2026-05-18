import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Plus, Calendar, Compass, MoreVertical } from 'lucide-react';
import { EmptyState } from '../components/EmptyState.jsx';
import { getUserMaps } from '../features/maps/mapService.js';

// Recursive helper to count total nodes in a map tree
function countNodes(node) {
  if (!node) return 0;
  let count = 1;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

export function Dashboard({ maps = [], onOpenMap, onNewMap, onConvertNotes, onSyncMaps }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('last-updated-desc');
  const [dbMaps, setDbMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMaps() {
      try {
        setLoading(true);
        const data = await getUserMaps();
        if (active) {
          const parsedMaps = data.map((row) => {
            const mapObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            return {
              ...mapObj,
              id: row.id,
              title: row.title || mapObj.title || 'Untitled Map',
              updatedAt: row.updated_at || mapObj.updatedAt || new Date().toISOString()
            };
          });
          setDbMaps(parsedMaps);
          if (onSyncMaps) {
            onSyncMaps(parsedMaps);
          }
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load mind maps.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadMaps();
    return () => { active = false; };
  }, []);

  // Filter maps by title in real-time
  const filteredMaps = useMemo(() => {
    return dbMaps.filter((map) =>
      map.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dbMaps, searchQuery]);

  // Sort maps dynamically based on the selected option
  const sortedMaps = useMemo(() => {
    return [...filteredMaps].sort((a, b) => {
      if (sortBy === 'last-updated-desc') {
        return new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0);
      }
      if (sortBy === 'last-updated-asc') {
        return new Date(a.updatedAt ?? 0) - new Date(b.updatedAt ?? 0);
      }
      if (sortBy === 'alphabetical-az') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'alphabetical-za') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [filteredMaps, sortBy]);

  return (
    <div className="dashboard-layout">
      {/* Top Sticky Navigation */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="logo-symbol">C</div>
          <span className="logo-text">CLASP</span>
          <span className="plan-badge">Free Plan • 150 node limit</span>
        </div>
        
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="dashboard-search"
            placeholder="Search your mind maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="dashboard-header-actions">
          <button type="button" className="secondary-action" onClick={onConvertNotes}>
            <Sparkles size={14} className="action-icon" />
            Convert Notes
          </button>
          <button type="button" className="primary-action" onClick={onNewMap}>
            <Plus size={14} className="action-icon" />
            Build from Scratch
          </button>
          <div className="avatar-placeholder" title="User Account">
            <span className="avatar-letter">A</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-content">
        {/* Hero Section */}
        <section className="dashboard-welcome">
          <div className="welcome-meta">
            <h1>Turn scattered thoughts into structured insight.</h1>
            <p>Create visual maps from scratch or transform messy notes into organized knowledge.</p>
          </div>
          
          {/* Action Cards Styled like Pinned Sticky Notes */}
          <div className="dashboard-cta-cards">
            <div className="cta-card convert sticky-lavender" onClick={onConvertNotes}>
              <span className="cursor-tag convert-tag">✨ AI Spark</span>
              <div className="cta-icon-wrapper">
                <Sparkles size={24} />
              </div>
              <h3>Convert Messy Notes</h3>
              <p>Paste raw notes, transcripts, or ideas and let CLASP organize them into a structured mind map.</p>
              <span className="cta-link">Generate with AI →</span>
            </div>

            <div className="cta-card scratch sticky-mint" onClick={onNewMap}>
              <span className="cursor-tag scratch-tag">🖋️ Blank Canvas</span>
              <div className="cta-icon-wrapper">
                <Plus size={24} />
              </div>
              <h3>Build from Scratch</h3>
              <p>Start with a blank canvas and shape your ideas freely.</p>
              <span className="cta-link">Start drafting →</span>
            </div>
          </div>
        </section>

        {/* Mind Maps Section */}
        <div className="dashboard-grid-section">
          <div className="grid-head">
            <h3>Your Mind Maps</h3>
            {maps.length > 0 && (
              <div className="sort-control-wrapper">
                <label htmlFor="dashboard-sort" className="sort-label-text">Sort by</label>
                <div className="select-container">
                  <select
                    id="dashboard-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="dashboard-sort-select"
                  >
                    <option value="last-updated-desc">Last Updated (Newest First)</option>
                    <option value="last-updated-asc">Last Updated (Oldest First)</option>
                    <option value="alphabetical-az">Title (A–Z)</option>
                    <option value="alphabetical-za">Title (Z–A)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Fetching your visual thinking space...</p>
            </div>
          ) : error ? (
            <div className="dashboard-error">
              <Compass size={40} className="error-icon" />
              <h3>Failed to load maps</h3>
              <p>{error}</p>
              <button
                type="button"
                className="primary-action"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : !dbMaps.length ? (
            <EmptyState onNewMap={onNewMap} onConvertNotes={onConvertNotes} />
          ) : !filteredMaps.length ? (
            <div className="dashboard-no-results">
              <Compass size={40} className="no-results-icon" />
              <h3>No matching maps found</h3>
              <p>Try searching for a different keyword or title.</p>
              <button
                type="button"
                className="secondary-action"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Query
              </button>
            </div>
          ) : (
            <div className="map-grid">
              {sortedMaps.map((map) => {
                const nodeCount = countNodes(map.root);
                return (
                  <button
                    key={map.id}
                    type="button"
                    className={`map-card ${map.aiGenerated ? 'ai-styled' : ''}`}
                    onClick={() => onOpenMap(map.id)}
                  >
                    {/* Thumbnail: A miniature static mind map preview using editor colors */}
                    <div className="map-thumb">
                      <svg viewBox="0 0 220 140" className="thumb-svg">
                        {/* Branch connectors painted with pastel accent line colors */}
                        <path d="M110 70 C144 58 156 38 190 30" stroke="#8B5CF6" />
                        <path d="M110 70 C150 76 162 82 196 82" stroke="#10B981" />
                        <path d="M110 70 C76 80 62 50 30 44" stroke="#38BDF8" />
                        <path d="M110 70 C96 90 92 110 76 112" stroke="#F59E0B" />
                        
                        {/* Root Node */}
                        <circle cx="110" cy="70" r="18" fill="#111827" />
                        <circle cx="110" cy="70" r="14" fill="#8B5CF6" opacity="0.3" />
                        
                        {/* Branches with exact pastel colors */}
                        <circle cx="190" cy="30" r="12" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1" />
                        <circle cx="196" cy="82" r="12" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
                        <circle cx="30" cy="44" r="12" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1" />
                        <circle cx="76" cy="112" r="12" fill="#FDE7D8" stroke="#F59E0B" strokeWidth="1" />
                      </svg>
                      {map.aiGenerated && (
                        <span className="ai-thumb-badge">
                          <Sparkles size={10} />
                          AI Draft
                        </span>
                      )}
                      
                      {/* Optional premium kebab menu */}
                      <button
                        type="button"
                        className="thumb-kebab-btn"
                        title="Map options"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Aesthetic click handler
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    <div className="card-info">
                      <span className="card-title">{map.title}</span>
                      <div className="card-metadata-row">
                        <span className="card-time">
                          <Calendar size={12} />
                          {new Date(map.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="card-node-count">
                          {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
