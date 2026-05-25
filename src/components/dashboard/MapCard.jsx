import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react';

const CARD_THEMES = [
  { bg: '#F5F1E8', stroke: '#9A7A4F', node: '#7D6848', center: '#2F2A23' },
  { bg: '#EEF4EA', stroke: '#7F9B72', node: '#5E7658', center: '#1F3728' },
  { bg: '#F6F0EA', stroke: '#B08B6A', node: '#8A6A52', center: '#3A2E26' },
  { bg: '#EEF2EF', stroke: '#7C9085', node: '#61766A', center: '#25352E' },
  { bg: '#F4F1EC', stroke: '#A19A88', node: '#787262', center: '#302E29' },
  { bg: '#F0F3ED', stroke: '#899C7C', node: '#66785A', center: '#263326' }
];

export function MapCard({ map, index, onOpen, onRename, onDuplicate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const theme = CARD_THEMES[index % CARD_THEMES.length];
  const nodeCount = map.nodeCount || 0;
  const timeString = map.timeString || 'Recently';

  useEffect(() => {
    function handleDocumentClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [menuOpen]);

  return (
    <div 
      className="map-card card-entrance" 
      onClick={() => onOpen(map.id)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${map.title || 'Untitled Map'}`}
      style={{ 
        backgroundColor: '#FFFFFF', 
        borderColor: '#EBEBE8',
        animationDelay: `${index * 0.08}s`
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(map.id);
        }
      }}
    >
      {/* Floating Kebab Options */}
      <div className="kebab-menu-container" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <button 
          type="button" 
          className={`thumb-kebab-btn ${menuOpen ? 'menu-active' : ''}`}
          title="Options"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreVertical size={16} />
        </button>
        
        {menuOpen && (
          <div className="kebab-dropdown">
            <button 
              type="button" 
              onClick={() => {
                setMenuOpen(false);
                onRename(map);
              }}
            >
              <Edit2 size={13} />
              Rename
            </button>
            <button 
              type="button" 
              onClick={() => {
                setMenuOpen(false);
                onDuplicate(map);
              }}
            >
              <Copy size={13} />
              Duplicate
            </button>
            <button 
              type="button" 
              className="delete-btn"
              onClick={() => {
                setMenuOpen(false);
                onDelete(map);
              }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Visual Thumbnail (Rounded Pastel Rectangle inside White Card Container) */}
      <div className="map-thumb" style={{ backgroundColor: theme.bg }}>
        <svg viewBox="0 0 220 140" className="thumb-svg">
          {/* Radial Branch Spokes */}
          <line x1="110" y1="70" x2="60" y2="40" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="160" y2="40" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="50" y2="70" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="170" y2="70" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="60" y2="100" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="160" y2="100" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="110" y2="25" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />
          <line x1="110" y1="70" x2="110" y2="115" stroke={theme.stroke} strokeWidth="1.2" opacity="0.85" />

          {/* Symmetrical Inner Nodes on lines */}
          <circle cx="85" cy="55" r="2" fill={theme.node} />
          <circle cx="135" cy="55" r="2" fill={theme.node} />
          <circle cx="80" cy="70" r="2" fill={theme.node} />
          <circle cx="140" cy="70" r="2" fill={theme.node} />
          <circle cx="85" cy="85" r="2" fill={theme.node} />
          <circle cx="135" cy="85" r="2" fill={theme.node} />
          <circle cx="110" cy="47" r="2" fill={theme.node} />
          <circle cx="110" cy="92" r="2" fill={theme.node} />

          {/* Symmetrical Outer Nodes */}
          <circle cx="60" cy="40" r="3.5" fill={theme.node} />
          <circle cx="160" cy="40" r="3.5" fill={theme.node} />
          <circle cx="50" cy="70" r="3.5" fill={theme.node} />
          <circle cx="170" cy="70" r="3.5" fill={theme.node} />
          <circle cx="60" cy="100" r="3.5" fill={theme.node} />
          <circle cx="160" cy="100" r="3.5" fill={theme.node} />
          <circle cx="110" cy="25" r="3.5" fill={theme.node} />
          <circle cx="110" cy="115" r="3.5" fill={theme.node} />

          {/* Center Root Node */}
          <circle cx="110" cy="70" r="6.5" fill={theme.center} />
          <circle cx="110" cy="70" r="11" stroke={theme.center} strokeWidth="1" fill="none" opacity="0.35" />
        </svg>
      </div>

      {/* Info details */}
      <div className="card-info">
        <h4 className="card-title">{map.title || 'Untitled Map'}</h4>
        <div className="card-metadata-row">
          <span className="card-time">
            {timeString}
          </span>
          <span className="card-metadata-bullet">&bull;</span>
          <span 
            className="card-node-count-badge"
            style={{ 
              backgroundColor: '#F1F1ED',
              color: '#6C726F'
            }}
          >
            {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
          </span>
        </div>
      </div>
    </div>
  );
}
