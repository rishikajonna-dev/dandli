import React from 'react';
import { HeroSection } from '../components/HeroSection.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

export function Dashboard({ maps, onOpenMap, onNewMap, onConvertNotes }) {
  return (
    <div className="dashboard">
      <HeroSection onConvertNotes={onConvertNotes} onBuildScratch={onNewMap} />
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Your maps</h2>
        </div>
        <div className="dashboard-actions">
          <button type="button" className="secondary-action" onClick={onConvertNotes}>Convert Notes</button>
          <button type="button" className="primary-action" onClick={onNewMap}>New Map</button>
        </div>
      </div>
      {!maps.length ? (
        <EmptyState onNewMap={onNewMap} onConvertNotes={onConvertNotes} />
      ) : (
        <div className="map-grid">
          {maps.map((map) => (
            <button key={map.id} type="button" className="map-card" onClick={() => onOpenMap(map.id)}>
              <div className="map-thumb">
                <svg viewBox="0 0 220 140">
                  <path d="M110 70 C144 58 156 38 190 30" />
                  <path d="M110 70 C150 76 162 82 196 82" />
                  <path d="M110 70 C76 80 62 50 30 44" />
                  <circle cx="110" cy="70" r="18" />
                </svg>
              </div>
              <span>{map.title}</span>
              <small>Last edited {new Date(map.updatedAt).toLocaleString()}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
