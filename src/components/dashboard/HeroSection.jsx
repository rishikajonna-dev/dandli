import React from 'react';
import { QuickActions } from './QuickActions.jsx';
import dandelionAsset from '../../assets/hero-dandelion.webp';

export function HeroSection({ mapCount, onNewMap, onConvertNotes, isSyncing }) {
  return (
    <section className="dashboard-hero-section">
      <div 
        className="dashboard-hero-background" 
        style={{ backgroundImage: `url(${dandelionAsset})` }}
        aria-hidden="true"
      />
      
      <div className="dashboard-hero-content">
        <p className="hero-eyebrow">YOUR WORKSPACE</p>
        <h1 className="hero-title">What are you mapping today?</h1>
        <div className="dashboard-hero-badge">
          {mapCount} {mapCount === 1 ? 'map' : 'maps'}
        </div>

        <QuickActions onNewMap={onNewMap} onConvertNotes={onConvertNotes} />
      </div>

      {isSyncing && (
        <div className="loading-preview-overlay">
          <div className="loading-preview-pill">
            <span className="spinner-icon"></span>
            <span>Loading preview</span>
          </div>
        </div>
      )}
    </section>
  );
}
