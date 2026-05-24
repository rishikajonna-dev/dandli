import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export function EmptyState({ onNewMap, onConvertNotes }) {
  return (
    <div className="dashboard-empty-state">
      <div className="empty-state-icon-container">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="empty-dandelion-svg">
          <path d="M12 22V13" />
          <circle cx="12" cy="11" r="1.5" fill="#14532D" />
          <path d="M12 11l-4-4" />
          <path d="M12 11l4-4" />
          <path d="M12 11l-5.5 1.5" />
          <path d="M12 11l5.5 1.5" />
          <path d="M12 11l-3 5" />
          <path d="M12 11l3 5" />
          <path d="M12 11V5" />
          <circle cx="8" cy="7" r="0.75" fill="#14532D" />
          <circle cx="16" cy="7" r="0.75" fill="#14532D" />
          <circle cx="6.5" cy="12.5" r="0.75" fill="#14532D" />
          <circle cx="17.5" cy="12.5" r="0.75" fill="#14532D" />
          <circle cx="9" cy="16" r="0.75" fill="#14532D" />
          <circle cx="15" cy="16" r="0.75" fill="#14532D" />
          <circle cx="12" cy="5" r="0.75" fill="#14532D" />
        </svg>
      </div>
      <h3 className="empty-state-title">No mind maps yet.</h3>
      <p className="empty-state-subtitle">Create your first map or convert notes into a visual structure.</p>
      <div className="empty-state-actions">
        <button type="button" className="empty-primary-btn" onClick={onNewMap}>
          <Plus size={16} />
          Build from Scratch
        </button>
        <button type="button" className="empty-secondary-btn" onClick={onConvertNotes}>
          <Sparkles size={16} />
          Convert Notes
        </button>
      </div>
    </div>
  );
}
