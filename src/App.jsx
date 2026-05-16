import React, { useState } from 'react';
import { MapCanvas } from './components/MapCanvas.jsx';

const initialTree = {
  id: 'root',
  label: 'CLASP Strategy',
  children: [
    {
      id: 'strategy',
      label: 'Strategy',
      children: [
        { id: 'positioning', label: 'Positioning', children: [{ id: 'clarity', label: 'Structural clarity', children: [] }, { id: 'fluidity', label: 'Miro fluidity', children: [] }], collapsed: false, color: null, metadata: { status: 'Define' } },
        { id: 'audience', label: 'Audience', children: [{ id: 'students', label: 'Students', children: [] }, { id: 'researchers', label: 'Researchers', children: [] }, { id: 'founders', label: 'Solo founders', children: [] }], collapsed: false, color: null, metadata: {} },
        { id: 'pricing', label: 'Pricing', children: [{ id: 'free', label: 'Free tier', children: [] }, { id: 'pro', label: 'Pro tier', children: [] }], collapsed: false, color: null, metadata: {} }
      ],
      collapsed: false,
      color: null,
      metadata: { status: 'Live' }
    },
    {
      id: 'research',
      title: 'Research',
      children: [
        { id: 'competitors', label: 'Competitors', children: [{ id: 'xmind', label: 'XMind', children: [] }, { id: 'mindnode', label: 'MindNode', children: [] }, { id: 'thebrain', text: 'TheBrain', children: [] }, { id: 'miro', label: 'Miro', children: [] }, { id: 'heptabase', label: 'Heptabase', children: [] }, { id: 'more-tools', label: 'Whiteboards', children: [] }], collapsed: false, color: null, metadata: { status: 'Scan' } },
        { id: 'insights', label: 'Insights', children: [{ id: 'fixed-direction', label: 'Fixed direction', children: [] }, { id: 'semantic-zoom', label: 'Semantic zoom', children: [] }], collapsed: false, color: null, metadata: {} }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    },
    {
      id: 'product',
      label: 'Product',
      children: [
        { id: 'canvas', label: 'Canvas', children: [{ id: 'pan', label: 'Pan', children: [] }, { id: 'zoom', label: 'Zoom', children: [] }, { id: 'select', label: 'Select', children: [] }], collapsed: false, color: null, metadata: {} },
        { id: 'editing', label: 'Editing', children: [{ id: 'rename', label: 'Rename nodes', children: [] }, { id: 'collapse', label: 'Collapse branches', children: [] }], collapsed: false, color: null, metadata: {} },
        { id: 'navigation', label: 'Navigation', children: [{ id: 'focus-mode', label: 'Focus mode', children: [] }, { id: 'breadcrumbs', label: 'Breadcrumbs', children: [] }], collapsed: false, color: null, metadata: {} }
      ],
      collapsed: false,
      color: null,
      metadata: { status: 'Build' }
    },
    {
      id: 'design',
      label: 'Design System',
      children: [
        { id: 'editorial', label: 'Editorial calm', children: [] },
        { id: 'translucent', label: 'Translucent tints', children: [] },
        { id: 'connectors', label: 'Smooth connectors', children: [] }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    },
    {
      id: 'growth',
      label: 'Growth',
      children: [
        { id: 'loops', label: 'Creation loops', children: [] },
        { id: 'sharing', label: 'Shareable maps', children: [] }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    },
    {
      id: 'systems',
      label: 'Systems',
      children: [
        { id: 'layout-engine', label: 'Layout engine', children: [{ id: 'measure-first', label: 'Measure first', children: [] }, { id: 'slots', label: 'Fixed slots', children: [] }, { id: 'inheritance', label: 'Direction inheritance', children: [] }], collapsed: false, color: null, metadata: { status: 'Core' } },
        { id: 'memoization', label: 'Memoization', children: [] }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    },
    {
      id: 'operations',
      label: 'Operations',
      children: [
        { id: 'roadmap', label: 'Roadmap', children: [] },
        { id: 'metrics', label: 'Metrics', children: [] }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    },
    {
      id: 'vision',
      label: 'Vision',
      children: [
        { id: 'thinking-system', label: 'Visual thinking system', children: [] },
        { id: 'knowledge-atlas', label: 'Knowledge atlas', children: [] }
      ],
      collapsed: false,
      color: null,
      metadata: {}
    }
  ],
  collapsed: false,
  color: null,
  metadata: { status: 'Root' }
};

function renameNode(node, id, label) {
  if (node.id === id) return { ...node, label };
  return {
    ...node,
    children: (node.children ?? []).map((child) => renameNode(child, id, label))
  };
}

function addChildNode(node, parentId, childNode) {
  if (node.id === parentId) {
    return {
      ...node,
      collapsed: false,
      children: [...(node.children ?? []), childNode]
    };
  }

  return {
    ...node,
    children: (node.children ?? []).map((child) => addChildNode(child, parentId, childNode))
  };
}

function deleteNode(node, id) {
  return {
    ...node,
    children: (node.children ?? [])
      .filter((child) => child.id !== id)
      .map((child) => deleteNode(child, id))
  };
}

export default function App() {
  const [tree, setTree] = useState(initialTree);
  const [expandedOverflow, setExpandedOverflow] = useState(new Set());

  function toggleOverflow(nodeId) {
    setExpandedOverflow((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Deterministic mind mapping</p>
          <h1>CLASP</h1>
        </div>
        <p className="header-note">Stable radial structure with inherited directional flow.</p>
      </header>

      <MapCanvas
        tree={tree}
        expandedOverflow={expandedOverflow}
        setExpandedOverflow={setExpandedOverflow}
        onToggleOverflow={toggleOverflow}
        onRenameNode={(id, label) => setTree((current) => renameNode(current, id, label))}
        onAddChild={(parentId, childNode) => setTree((current) => addChildNode(current, parentId, childNode))}
        onDeleteNode={(id) => setTree((current) => current.id === id ? current : deleteNode(current, id))}
      />
    </main>
  );
}
