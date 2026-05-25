import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

export function QuickActions({ onNewMap, onConvertNotes }) {
  return (
    <div className="quick-actions-container">
      <button
        type="button"
        className="action-card-button" 
        onClick={onNewMap}
      >
        <div className="action-circle-icon primary-green-bg">
          <Plus size={32} color="#ffffff" strokeWidth={2.5} />
        </div>
        <h3 className="action-title">Build from Scratch</h3>
        <p className="action-subtitle">Start with a blank canvas</p>
      </button>

      <button
        type="button"
        className="action-card-button" 
        onClick={onConvertNotes}
      >
        <div className="action-circle-icon light-gray-bg">
          <Sparkles size={28} color="#1c2421" strokeWidth={2} />
        </div>
        <h3 className="action-title">Convert Notes</h3>
        <p className="action-subtitle">Paste text → instant map</p>
      </button>
    </div>
  );
}
