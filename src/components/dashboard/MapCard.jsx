import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Copy, Trash2, Star } from 'lucide-react';

function MiniMapPreview({ map }) {
  // Use map.id to deterministically seed the layout variation
  const seed = map.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
  
  // Custom minimal palettes matching the user's design document exactly
  const palettes = [
    // 1. Sage Green
    { bg: '#F5F6F2', center: '#9CAE96', stroke: '#A6B7A0', primary: '#A6B7A0', secondary: '#BCCBBA' },
    // 2. Warm Sand
    { bg: '#F8F4EE', center: '#D9C3B0', stroke: '#E5D5C6', primary: '#DEC9B7', secondary: '#EAE0D5' },
    // 3. Slate Blue
    { bg: '#F3F5F7', center: '#9FAEB5', stroke: '#B5C2C9', primary: '#A9B8BE', secondary: '#C3CCD2' },
    // 4. Muted Lavender
    { bg: '#F6F4F7', center: '#A49FB6', stroke: '#B9B5C9', primary: '#ADA8BE', secondary: '#C6C3D2' },
    // 5. Muted Terracotta
    { bg: '#F9F3F1', center: '#DBA392', stroke: '#E7BFB3', primary: '#E0AD9E', secondary: '#ECDDD8' }
  ];
  const pal = palettes[seed % palettes.length];

  const VW = 280;
  const VH = 160;
  const CX = VW / 2;
  const CY = VH / 2;

  // Generate radial branches deterministically but asymmetrically
  const numBranches = 6 + (seed % 4); // 6 to 9 branches
  const branches = [];

  for (let i = 0; i < numBranches; i++) {
    const baseAngle = (i * 2 * Math.PI) / numBranches;
    // Controlled offset to avoid clinical/perfect symmetry
    const jitter = (((seed + i * 17) % 9) - 4) * 0.05;
    const angle = baseAngle + jitter;

    // Branches can be short, medium, or long
    const lengthType = (seed + i * 13) % 3;
    const dist1 = 34 + lengthType * 9 + ((seed + i * 7) % 3) * 3; // primary distance

    // Decide if primary node is hollow or solid
    const isHollow1 = ((seed + i * 19) % 5) === 0;
    const r1 = 3 + ((seed + i * 11) % 3) * 1.0; // primary radius (3.0 to 5.0)

    const subNodes = [];
    
    // Add subnodes to some branches to establish an organic hierarchy rhythm
    const hasSubNode = ((seed + i * 29) % 3) > 0;
    if (hasSubNode) {
      const dist2 = dist1 + 12 + ((seed + i * 23) % 3) * 3;
      const isHollow2 = ((seed + i * 31) % 6) === 0;
      const r2 = 1.8 + ((seed + i * 37) % 2) * 0.8; // secondary radius
      subNodes.push({ dist: dist2, r: r2, hollow: isHollow2 });

      // Extremely small tertiary node at the tip for visual detail
      const hasTertiary = ((seed + i * 43) % 4) === 0;
      if (hasTertiary) {
        subNodes.push({ dist: dist2 + 8, r: 1.0, hollow: false });
      }
    }

    branches.push({
      angle,
      dist1,
      r1,
      hollow1: isHollow1,
      subNodes
    });
  }

  return (
    <div className="map-card-preview" style={{ background: pal.bg }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        xmlns="http://www.w3.org/2000/svg"
        className="map-card-svg"
        aria-hidden="true"
      >
        {/* Render radiating connection lines */}
        {branches.map((b, idx) => {
          const x1 = CX + b.dist1 * Math.cos(b.angle);
          const y1 = CY + b.dist1 * Math.sin(b.angle);

          // Lines are thin, elegant and muted
          const lines = [
            <line
              key={`line-1-${idx}`}
              x1={CX}
              y1={CY}
              x2={x1}
              y2={y1}
              stroke={pal.stroke}
              strokeWidth="0.8"
              opacity="0.65"
            />
          ];

          let prevX = x1;
          let prevY = y1;

          b.subNodes.forEach((sub, subIdx) => {
            const sx = CX + sub.dist * Math.cos(b.angle);
            const sy = CY + sub.dist * Math.sin(b.angle);
            lines.push(
              <line
                key={`line-sub-${idx}-${subIdx}`}
                x1={prevX}
                y1={prevY}
                x2={sx}
                y2={sy}
                stroke={pal.stroke}
                strokeWidth="0.8"
                opacity="0.5"
              />
            );
            prevX = sx;
            prevY = sy;
          });

          return <g key={`branch-lines-${idx}`}>{lines}</g>;
        })}

        {/* Render nodes: Primary nodes & Subnodes */}
        {branches.map((b, idx) => {
          const x1 = CX + b.dist1 * Math.cos(b.angle);
          const y1 = CY + b.dist1 * Math.sin(b.angle);

          const nodesMarkup = [
            <circle
              key={`node-1-${idx}`}
              cx={x1}
              cy={y1}
              r={b.r1}
              fill={b.hollow1 ? 'transparent' : pal.primary}
              stroke={pal.stroke}
              strokeWidth={b.hollow1 ? '0.9' : '0'}
              opacity="0.85"
            />
          ];

          b.subNodes.forEach((sub, subIdx) => {
            const sx = CX + sub.dist * Math.cos(b.angle);
            const sy = CY + sub.dist * Math.sin(b.angle);
            nodesMarkup.push(
              <circle
                key={`node-sub-${idx}-${subIdx}`}
                cx={sx}
                cy={sy}
                r={sub.r}
                fill={sub.hollow ? 'transparent' : pal.secondary}
                stroke={pal.stroke}
                strokeWidth={sub.hollow ? '0.8' : '0'}
                opacity="0.75"
              />
            );
          });

          return <g key={`branch-nodes-${idx}`}>{nodesMarkup}</g>;
        })}

        {/* Central Anchor Anchor: Single dominant center circle */}
        <circle
          cx={CX}
          cy={CY}
          r="14"
          fill={pal.center}
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

export function MapCard({ map, index, onOpen, onRename, onDuplicate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const nodeCount = (map?.data?.nodes || map?.nodes || []).length;

  const updatedAt = map.updated_at
    ? (() => {
        const diff = Date.now() - new Date(map.updated_at).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        return new Date(map.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      })()
    : '';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <article
      className="map-card"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onOpen?.(map.id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen?.(map.id)}
      aria-label={`Open ${map.title || 'Untitled'}`}
    >
      <MiniMapPreview map={map} />

      <div className="map-card-meta">
        <div className="map-card-info">
          <h3 className="map-card-title">{map.title || 'Untitled'}</h3>
          <div className="map-card-sub">
            {updatedAt && <span className="map-card-date">Edited {updatedAt}</span>}
            {nodeCount > 0 && <span className="map-card-nodes">{nodeCount} nodes</span>}
          </div>
        </div>

        <div className="map-card-actions" onClick={(e) => e.stopPropagation()}>
          <div className="map-card-menu-wrapper" ref={menuRef}>
            <button
              type="button"
              className="map-card-menu-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Map options"
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div className="map-card-menu" role="menu">
                <button role="menuitem" className="menu-item--danger" onClick={() => { onDelete?.(map.id); setMenuOpen(false); }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}