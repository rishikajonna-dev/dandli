export const sampleMap = {
  id: 'map-clasp-strategy',
  title: 'CLASP Strategy',
  updatedAt: new Date().toISOString(),
  aiGenerated: false,
  root: {
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
          { id: 'competitors', label: 'Competitors', children: [{ id: 'xmind', label: 'XMind', children: [] }, { id: 'mindnode', label: 'MindNode', children: [] }, { id: 'thebrain', text: 'TheBrain', children: [] }, { id: 'miro', label: 'Miro', children: [] }, { id: 'heptabase', label: 'Heptabase', children: [] }, { id: 'whiteboards', label: 'Whiteboards', children: [] }], collapsed: false, color: null, metadata: { status: 'Scan' } },
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
      { id: 'design', label: 'Design System', children: [{ id: 'editorial', label: 'Editorial calm', children: [] }, { id: 'translucent', label: 'Translucent tints', children: [] }, { id: 'connectors', label: 'Smooth connectors', children: [] }], collapsed: false, color: null, metadata: {} },
      { id: 'growth', label: 'Growth', children: [{ id: 'loops', label: 'Creation loops', children: [] }, { id: 'sharing', label: 'Shareable maps', children: [] }], collapsed: false, color: null, metadata: {} },
      { id: 'systems', label: 'Systems', children: [{ id: 'layout-engine', label: 'Layout engine', children: [{ id: 'measure-first', label: 'Measure first', children: [] }, { id: 'slots', label: 'Fixed slots', children: [] }, { id: 'inheritance', label: 'Direction inheritance', children: [] }], collapsed: false, color: null, metadata: { status: 'Core' } }, { id: 'memoization', label: 'Memoization', children: [] }], collapsed: false, color: null, metadata: {} },
      { id: 'operations', label: 'Operations', children: [{ id: 'roadmap', label: 'Roadmap', children: [] }, { id: 'metrics', label: 'Metrics', children: [] }], collapsed: false, color: null, metadata: {} },
      { id: 'vision', label: 'Vision', children: [{ id: 'thinking-system', label: 'Visual thinking system', children: [] }, { id: 'knowledge-atlas', label: 'Knowledge atlas', children: [] }], collapsed: false, color: null, metadata: {} }
    ],
    collapsed: false,
    color: null,
    metadata: { status: 'Root' }
  }
};

export function createEmptyMap(title) {
  const now = new Date().toISOString();
  return {
    id: `map-${Date.now().toString(36)}`,
    title,
    updatedAt: now,
    aiGenerated: false,
    root: {
      id: 'root',
      label: title,
      children: [],
      collapsed: false,
      color: null,
      metadata: {}
    }
  };
}

export function createMockAiMap(notes, context = '') {
  const title = context.trim() || 'Generated Map';
  const chunks = notes
    .split(/\n|\.|;|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
  const groups = chunks.length ? chunks : ['Audience insights', 'Pricing ideas', 'Research notes', 'Growth experiments'];

  return {
    ...createEmptyMap(title),
    aiGenerated: true,
    root: {
      id: 'root',
      label: title,
      children: groups.slice(0, 6).map((item, index) => ({
        id: `ai-${index}`,
        label: item.length > 34 ? `${item.slice(0, 31)}...` : item,
        children: groups
          .filter((_, childIndex) => childIndex !== index && childIndex % 3 === index % 3)
          .slice(0, 3)
          .map((child, childIndex) => ({
            id: `ai-${index}-${childIndex}`,
            label: child.length > 30 ? `${child.slice(0, 27)}...` : child,
            children: [],
            collapsed: false,
            color: null,
            metadata: {}
          })),
        collapsed: false,
        color: null,
        metadata: {}
      })),
      collapsed: false,
      color: null,
      metadata: {}
    }
  };
}
