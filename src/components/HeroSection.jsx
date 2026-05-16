import React from 'react';
import { FloatingCards } from './FloatingCards.jsx';
import { MiniMapPreview } from './MiniMapPreview.jsx';

export function HeroSection({ onConvertNotes, onBuildScratch }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">Visual thinking, cleaned up</p>
        <h2>Scattered thoughts, transformed into mind maps.</h2>
        <p>Paste messy notes, ideas, and research. Clasp instantly turns them into a clean visual map and a structured outline that stay perfectly in sync.</p>
        <div className="hero-actions">
          <button type="button" className="primary-action" onClick={onConvertNotes}>Convert Notes</button>
          <button type="button" className="secondary-action" onClick={onBuildScratch}>Build from Scratch</button>
        </div>
      </div>
      <div className="hero-visual">
        <FloatingCards />
        <div className="flow-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <MiniMapPreview />
      </div>
    </section>
  );
}
