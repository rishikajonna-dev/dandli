import React from 'react';
import { rgba } from '../utils/colors.js';

function bezierPath(connector) {
  const { source, target, axis } = connector;

  if (axis === 'x') {
    const delta = Math.abs(target.x - source.x);
    const control = Math.max(72, delta * 0.48);
    const sign = target.x >= source.x ? 1 : -1;
    return `M ${source.x} ${source.y} C ${source.x + control * sign} ${source.y}, ${target.x - control * sign} ${target.y}, ${target.x} ${target.y}`;
  }

  const delta = Math.abs(target.y - source.y);
  const control = Math.max(72, delta * 0.48);
  const sign = target.y >= source.y ? 1 : -1;
  return `M ${source.x} ${source.y} C ${source.x} ${source.y + control * sign}, ${target.x} ${target.y - control * sign}, ${target.x} ${target.y}`;
}

export const Connector = React.memo(function Connector({ connector, emphasis = 'normal' }) {
  const opacity = emphasis === 'dimmed' ? 0.18 : emphasis === 'strong' ? 0.72 : 0.45;
  const stroke = rgba(connector.branchColor, opacity);

  return (
    <path
      className={`connector connector-${emphasis}`}
      d={bezierPath(connector)}
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  );
});
