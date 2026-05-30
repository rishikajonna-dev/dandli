import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import dashboardBg from '../../assets/dashboard_bg.png';

export function HeroSection({ mapCount, onNewMap, onConvertNotes, isSyncing }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="dashboard-hero">
      <div
        className="dashboard-hero-bg"
        style={{ backgroundImage: `url(${dashboardBg})` }}
        aria-hidden="true"
      />
      <div className="dashboard-hero-overlay" aria-hidden="true" />

      <div className="dashboard-hero-content">
        <p className="hero-greeting">{greeting}</p>
        <h1 className="hero-title">Where will your<br />thoughts lead?</h1>
        <p className="hero-subtitle">
          Capture ideas, connect the dots,<br />
          and bring clarity to complexity.
        </p>

        <div className="hero-actions">
          <button type="button" className="hero-btn-primary" onClick={onNewMap}>
            <Plus size={16} strokeWidth={2.5} />
            New Map
          </button>
          <button type="button" className="hero-btn-secondary" onClick={onConvertNotes}>
            <Sparkles size={15} strokeWidth={2} />
            Convert Notes
          </button>
        </div>
      </div>

      {isSyncing && (
        <div className="hero-syncing-badge">
          <span className="syncing-dot" />
          Syncing…
        </div>
      )}
    </section>
  );
}