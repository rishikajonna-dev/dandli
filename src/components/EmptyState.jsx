import React from 'react';

export function EmptyState({ onNewMap, onConvertNotes }) {
  return (
    <section className="empty-state">
      <h2>Your first map is waiting.</h2>
      <p>Start from a blank canvas or paste notes and let Clasp draft the structure.</p>
      <div className="empty-actions">
        <button type="button" className="primary-action" onClick={onNewMap}>New Map</button>
        <button type="button" className="secondary-action" onClick={onConvertNotes}>Convert Notes</button>
      </div>
    </section>
  );
}
