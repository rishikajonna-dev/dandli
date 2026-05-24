import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export function EmptyState({ onNewMap, onConvertNotes }) {
  return (
    <section className="empty-state">
      <div className="empty-illustration">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
          <path d="M12 22V13" />
          <circle cx="12" cy="11" r="1.5" fill="currentColor" />
          <path d="M12 11l-4-4" />
          <path d="M12 11l4-4" />
          <path d="M12 11l-5.5 1.5" />
          <path d="M12 11l5.5 1.5" />
          <path d="M12 11l-3 5" />
          <path d="M12 11l3 5" />
          <path d="M12 11V5" />
          <circle cx="8" cy="7" r="0.75" fill="currentColor" />
          <circle cx="16" cy="7" r="0.75" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r="0.75" fill="currentColor" />
          <circle cx="17.5" cy="12.5" r="0.75" fill="currentColor" />
          <circle cx="9" cy="16" r="0.75" fill="currentColor" />
          <circle cx="15" cy="16" r="0.75" fill="currentColor" />
          <circle cx="12" cy="5" r="0.75" fill="currentColor" />
        </svg>
      </div>
      <h2>No mind maps yet.</h2>
      <p>Create your first map or convert notes into a visual structure.</p>
      <div className="empty-actions">
        <button type="button" className="primary-action" onClick={onNewMap}>
          <Plus size={16} />
          Build from Scratch
        </button>
        <button type="button" className="secondary-action" onClick={onConvertNotes}>
          <Sparkles size={16} />
          Convert Notes
        </button>
      </div>
    </section>
  );
}

