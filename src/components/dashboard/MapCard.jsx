import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react';

const CARD_THEMES = [
  { bg: '#F8F2FF', stroke: '#C084FC', node: '#A855F7', center: '#7E22CE', border: '#F1E6FF' }, // Lavender
  { bg: '#F0F7FF', stroke: '#38BDF8', node: '#0EA5E9', center: '#0369A1', border: '#E0EEFF' }, // Sky Blue
  { bg: '#F2FAF5', stroke: '#81C784', node: '#4CAF50', center: '#1B5E20', border: '#E3F5EB' }, // Mint
  { bg: '#FFF2F9', stroke: '#F472B6', node: '#EC4899', center: '#BE185D', border: '#FFE5F4' }, // Pink
  { bg: '#FFFDEC', stroke: '#FACC15', node: '#EAB308', center: '#A16207', border: '#FFF9D4' }, // Yellow
  { bg: '#F8FAFC', stroke: '#94A3B8', node: '#64748B', center: '#334155', border: '#EBEFF5' }  // Grey
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
