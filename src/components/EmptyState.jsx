import React from 'react';
import { Sparkles, Plus, Compass } from 'lucide-react';

export function EmptyState({ onNewMap, onConvertNotes }) {
  return (
    <section className="empty-state">
      <div className="empty-illustration">
        <Compass size={48} className="empty-icon" />
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
