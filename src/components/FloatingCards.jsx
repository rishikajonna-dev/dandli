import React from 'react';

const cardTexts = [
  'Need to compare competitors',
  'Pricing ideas',
  'Research notes',
  'Audience insights',
  'Growth experiments',
  'Random thoughts'
];

const rotations = [-5, 3, -2, 5, -4, 2];

export function FloatingCards() {
  return (
    <div className="floating-cards" aria-hidden="true">
      {cardTexts.map((text, index) => (
        <span key={text} className="floating-card" style={{ '--rotate': `${rotations[index]}deg`, '--delay': `${index * 80}ms` }}>
          {text}
        </span>
      ))}
    </div>
  );
}
