import React from 'react';

export function MiniMapPreview() {
  return (
    <svg className="mini-map-preview" viewBox="0 0 360 250" aria-hidden="true">
      <path className="mini-line purple" d="M180 124 C224 118 246 76 288 62" />
      <path className="mini-line cyan" d="M180 124 C226 132 250 126 306 126" />
      <path className="mini-line green" d="M180 124 C220 156 246 184 292 204" />
      <path className="mini-line orange" d="M180 124 C132 128 102 88 64 70" />
      <path className="mini-line pink" d="M180 124 C132 146 104 180 64 198" />
      <rect className="mini-node root" x="120" y="94" width="120" height="60" rx="22" />
      <text x="180" y="130" textAnchor="middle">Clasp</text>
      {[
        [260, 44, 'Research'],
        [276, 108, 'Pricing'],
        [264, 188, 'Growth'],
        [30, 52, 'Audience'],
        [28, 180, 'Ideas']
      ].map(([x, y, label]) => (
        <g key={label}>
          <rect className="mini-node" x={x} y={y} width="72" height="30" rx="14" />
          <text x={x + 36} y={y + 20} textAnchor="middle">{label}</text>
        </g>
      ))}
    </svg>
  );
}
