import React from 'react';
import { exampleTemplates } from '../../data/exampleTemplates.js';

const CARD_STYLES = {
  'template-startup-idea': {
    bg: '#FCF3F0', // Soft pastel rose/peach
    border: 'rgba(235, 120, 95, 0.15)',
    hoverBg: '#FAF0EB',
    subtitle: 'Outline hypotheses, define value props, and map marketing channels.',
  },
  'template-research-notes': {
    bg: '#F0F3FA', // Soft pastel blue/lavender
    border: 'rgba(99, 133, 219, 0.15)',
    hoverBg: '#E9EEF7',
    subtitle: 'Organize literature reviews, methodologies, and qualitative insights.',
  },
  'template-meeting-notes': {
    bg: '#EFF6F2', // Soft pastel sage/green
    border: 'rgba(74, 155, 114, 0.15)',
    hoverBg: '#E7F2EC',
    subtitle: 'Track team alignment, discussion summaries, and actionable items.',
  },
  'template-case-study': {
    bg: '#FCF7ED', // Soft pastel amber/cream
    border: 'rgba(224, 180, 99, 0.15)',
    hoverBg: '#FAF2E1',
    subtitle: 'Structure client challenges, deployed solutions, and key results.',
  },
};

export function EmptyState({ onCreateMapFromTemplate }) {
  return (
    <div className="dashboard-empty-state-container">
      <div className="empty-state-intro">
        <h3 className="empty-state-title-premium">Not sure where to start?</h3>
        <p className="empty-state-subtitle-premium">Start with an example.</p>
      </div>

      <div className="example-cards-grid">
        {exampleTemplates.map((template) => {
          const style = CARD_STYLES[template.id] || {
            bg: '#F9F9FB',
            border: 'rgba(0,0,0,0.06)',
            hoverBg: '#F3F3F5',
            subtitle: 'Start mapping your thoughts with this custom workspace.',
          };

          return (
            <button
              key={template.id}
              type="button"
              className="example-template-card"
              onClick={() => onCreateMapFromTemplate?.(template)}
              style={{
                '--card-bg': style.bg,
                '--card-border': style.border,
                '--card-hover-bg': style.hoverBg,
              }}
            >
              <div className="template-card-header">
                <span className="template-card-title">{template.title}</span>
              </div>
              <p className="template-card-subtitle">{style.subtitle}</p>
              <div className="template-card-action">
                <span>Explore template</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
