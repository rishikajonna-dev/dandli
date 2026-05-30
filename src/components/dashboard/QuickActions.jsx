import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export function QuickActions({ onNewMap, onConvertNotes }) {
  return (
    <div className="quick-actions-container">
      <button
        type="button"
        className="black-pill-btn" 
        onClick={onNewMap}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>New Map</span>
      </button>

      <button
        type="button"
        className="black-pill-btn" 
        onClick={onConvertNotes}
      >
        <Sparkles size={15} strokeWidth={2} />
        <span>Convert Notes</span>
      </button>
    </div>
  );
}
