import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { create } from 'zustand';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Focus,
  GitBranch,
  LayoutDashboard,
  Link,
  Loader2,
  Lock,
  LogIn,
  MoreHorizontal,
  MousePointer2,
  PanelRight,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  X,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import './styles.css';

const colours = ['#C1603A', '#4A7C6F', '#6E6BB7', '#C69C39', '#A64B6B', '#327B9A', '#66723D'];

const initialMaps = [
  {
    id: 'map-launch',
    title: 'Launch plan',
    updatedAt: '2026-05-15T09:40:00.000Z',
    isPublic: true,
    publicSlug: 'V1StGXR8',
    content: makeMapFromTree({
      label: 'Clasp launch',
      children: [
        { label: 'First users', children: [{ label: 'Students' }, { label: 'Solo founders' }, { label: 'Researchers' }] },
        { label: 'Core loop', children: [{ label: 'Paste chaos' }, { label: 'Map appears' }, { label: 'Outline syncs' }] },
        { label: 'Pricing', children: [{ label: 'Free limits' }, { label: 'Casual plan' }, { label: 'Pro plan' }] }
      ]
    })
  },
  {
    id: 'map-research',
    title: 'Research notes',
    updatedAt: '2026-05-14T17:10:00.000Z',
    isPublic: false,
    publicSlug: null,
    content: makeMapFromTree({
      label: 'Cognition tools',
      children: [
        { label: 'Messy capture', children: [{ label: 'Low friction' }, { label: 'No folders first' }] },
        { label: 'Structure later', children: [{ label: 'Clusters' }, { label: 'Hierarchy' }] }
      ]
    })
  }
];

const useClaspStore = create((set, get) => ({
  route: '/',
  previousRoute: '/dashboard',
  onboardingDone: false,
  maps: initialMaps,
  activeMapId: 'map-launch',
  selectedNodeId: 'node_root',
  focusedNodeId: null,
  focusMode: false,
  saveStatus: 'Saved',
  modal: null,
  search: '',
  plan: 'free',
  nodeCount: 34,
  aiMapCount: 1,

  navigate(route) {
    set({ previousRoute: get().route, route, modal: null });
  },
  openMap(id) {
    const root = get().maps.find((map) => map.id === id)?.content.nodes[0]?.id ?? null;
    set({ activeMapId: id, selectedNodeId: root, focusedNodeId: null, route: `/map/${id}`, modal: null });
  },
  setModal(modal) {
    set({ modal });
  },
  setSearch(search) {
    set({ search });
  },
  setSelectedNode(id) {
    set({ selectedNodeId: id, focusedNodeId: get().focusMode ? id : get().focusedNodeId });
  },
  toggleFocusMode() {
    const next = !get().focusMode;
    set({ focusMode: next, focusedNodeId: next ? get().selectedNodeId : null });
  },
  setFocusedNode(id) {
    set({ focusedNodeId: id });
  },
  createMap(topic) {
    const id = `map-${Date.now()}`;
    const map = {
      id,
      title: topic || 'Untitled map',
      updatedAt: new Date().toISOString(),
      isPublic: false,
      publicSlug: null,
      content: makeMapFromTree({ label: topic || 'Untitled map', children: [] })
    };
    set((state) => ({
      maps: [map, ...state.maps],
      activeMapId: id,
      selectedNodeId: 'node_root',
      focusedNodeId: null,
      modal: null,
      route: `/map/${id}`
    }));
  },
  generateMap(notes, context) {
    const tree = clusterNotes(notes, context);
    const id = `map-${Date.now()}`;
    const map = {
      id,
      title: tree.label,
      updatedAt: new Date().toISOString(),
      isPublic: false,
      publicSlug: null,
      content: makeMapFromTree(tree)
    };
    set((state) => ({
      maps: [map, ...state.maps],
      activeMapId: id,
      selectedNodeId: 'node_root',
      focusedNodeId: null,
      aiMapCount: state.aiMapCount + 1,
      modal: null,
      route: `/map/${id}`
    }));
  },
  updateMapTitle(title) {
    updateActiveMap(set, get, (map) => ({ ...map, title, updatedAt: new Date().toISOString() }));
    markDirty(set);
  },
  updateNodeLabel(id, label) {
    updateActiveMap(set, get, (map) => ({
      ...map,
      title: id === 'node_root' ? label : map.title,
      updatedAt: new Date().toISOString(),
      content: {
        ...map.content,
        nodes: map.content.nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label } } : node))
      }
    }));
    markDirty(set);
  },
  moveNode(id, position) {
    updateActiveMap(set, get, (map) => ({
      ...map,
      updatedAt: new Date().toISOString(),
      content: {
        ...map.content,
        nodes: map.content.nodes.map((node) => (node.id === id ? { ...node, position } : node))
      }
    }));
    markDirty(set);
  },
  addNode(parentId) {
    const state = get();
    if (state.plan === 'free' && state.nodeCount >= 150) {
      set({ modal: 'node-limit' });
      return;
    }
    const map = state.maps.find((item) => item.id === state.activeMapId);
    if (!map) return;
    const parent = map.content.nodes.find((node) => node.id === parentId);
    const siblings = map.content.edges.filter((edge) => edge.source === parentId).length;
    const id = `node_${Date.now()}`;
    const angle = parent?.data.isRoot ? angleForIndex(siblings, siblings + 1) : (parent?.data.angle ?? 0) + (siblings - 1) * 14;
    const side = sideForAngle(angle);
    const vector = vectorFromAngle(angle);
    const colour = parent?.data.isRoot ? colours[siblings % colours.length] : parent?.data.colour ?? colours[0];
    const node = {
      id,
      type: 'claspNode',
      data: { label: 'New branch', colour, isRoot: false, side, angle },
      position: {
        x: (parent?.position.x ?? 520) + vector.x * 210,
        y: (parent?.position.y ?? 300) + vector.y * 154 + (siblings - 1) * 44
      }
    };
    const edge = { id: `edge_${id}`, source: parentId, target: id, type: 'smoothstep', colour };
    updateActiveMap(set, get, (activeMap) => ({
      ...activeMap,
      updatedAt: new Date().toISOString(),
      content: {
        ...activeMap.content,
        nodes: [...activeMap.content.nodes, node],
        edges: [...activeMap.content.edges, edge]
      }
    }));
    set({ selectedNodeId: id, nodeCount: state.nodeCount + 1 });
    markDirty(set);
  },
  deleteNode(id) {
    if (id === 'node_root') return;
    const map = get().maps.find((item) => item.id === get().activeMapId);
    if (!map) return;
    const descendants = getDescendants(id, map.content.edges);
    const remove = new Set([id, ...descendants]);
    updateActiveMap(set, get, (activeMap) => ({
      ...activeMap,
      updatedAt: new Date().toISOString(),
      content: {
        ...activeMap.content,
        nodes: activeMap.content.nodes.filter((node) => !remove.has(node.id)),
        edges: activeMap.content.edges.filter((edge) => !remove.has(edge.source) && !remove.has(edge.target))
      }
    }));
    set({ selectedNodeId: 'node_root', focusedNodeId: null });
    markDirty(set);
  },
  reattachEdge(edgeId, source, target) {
    updateActiveMap(set, get, (map) => ({
      ...map,
      updatedAt: new Date().toISOString(),
      content: {
        ...map.content,
        edges: map.content.edges.map((edge) => (edge.id === edgeId ? { ...edge, source, target } : edge))
      }
    }));
    markDirty(set);
  },
  toggleShare() {
    updateActiveMap(set, get, (map) => ({
      ...map,
      isPublic: !map.isPublic,
      publicSlug: map.isPublic ? null : map.publicSlug || nanoSlug(),
      updatedAt: new Date().toISOString()
    }));
  },
  completeOnboarding(topic) {
    get().createMap(topic || 'My first map');
    set({ onboardingDone: true });
  },
  upgrade(plan) {
    set({ plan, route: get().previousRoute || '/dashboard' });
  }
}));

let saveTimer;
function markDirty(set) {
  clearTimeout(saveTimer);
  set({ saveStatus: 'Saving...' });
  saveTimer = setTimeout(() => set({ saveStatus: 'Saved' }), 1400);
}

function updateActiveMap(set, get, mapper) {
  const id = get().activeMapId;
  set((state) => ({ maps: state.maps.map((map) => (map.id === id ? mapper(map) : map)) }));
}

function makeMapFromTree(tree) {
  const nodes = [];
  const edges = [];
  const rootX = 520;
  const rootY = 340;
  const root = {
    id: 'node_root',
    type: 'claspNode',
    data: { label: tree.label, colour: colours[0], isRoot: true, side: 'center', angle: 0 },
    position: { x: rootX, y: rootY }
  };
  nodes.push(root);

  function walk(items = [], parent, depth, branchColour, baseAngle) {
    const spread = Math.min(42, Math.max(0, (items.length - 1) * 16));
    const radiusX = depth === 1 ? 250 : 190;
    const radiusY = depth === 1 ? 160 : 90;
    items.forEach((item, index) => {
      const id = `node_${nodes.length + 1}`;
      const colour = branchColour || colours[index % colours.length];
      const angle = baseAngle + (items.length > 1 ? (index / (items.length - 1) - 0.5) * spread : 0);
      const vector = vectorFromAngle(angle);
      const position = {
        x: parent.position.x + vector.x * radiusX,
        y: parent.position.y + vector.y * radiusY
      };
      const node = {
        id,
        type: 'claspNode',
        data: { label: item.label, colour, isRoot: false, side: sideForAngle(angle), angle },
        position
      };
      nodes.push(node);
      edges.push({ id: `edge_${parent.id}_${id}`, source: parent.id, target: id, type: 'smoothstep', colour });
      if (item.children?.length) walk(item.children, node, depth + 1, colour, angle);
    });
  }

  const children = tree.children || [];
  children.forEach((child, index) => {
    const angle = angleForIndex(index, children.length);
    walk([child], root, 1, colours[index % colours.length], angle);
  });
  return { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } };
}

function angleForIndex(index, total) {
  if (total <= 1) return 0;
  return -90 + (index * 360) / total;
}

function vectorFromAngle(angle) {
  const radians = (angle * Math.PI) / 180;
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

function sideForAngle(angle) {
  const vector = vectorFromAngle(angle);
  if (vector.x < -0.28) return 'left';
  if (vector.y < -0.55) return 'top';
  if (vector.y > 0.55) return 'bottom';
  return 'right';
}

function nodeAnchor(node, toward) {
  const center = { x: node.position.x + 64, y: node.position.y + 22 };
  const target = { x: toward.position.x + 64, y: toward.position.y + 22 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: center.x + (dx / length) * 62,
    y: center.y + (dy / length) * 22
  };
}

function clusterNotes(notes, context) {
  const clean = notes.trim();
  const root = context?.trim() || clean.split(/[.\n]/).find(Boolean)?.slice(0, 42) || 'Untitled map';
  const chunks = clean
    .split(/\n|\.|;|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 3)
    .slice(0, 21);
  const buckets = ['Ideas', 'Actions', 'Questions', 'Risks', 'People', 'Timeline', 'Resources'];
  const children = buckets
    .map((label, bucketIndex) => ({
      label,
      children: chunks
        .filter((_, index) => index % buckets.length === bucketIndex)
        .slice(0, 4)
        .map((item) => ({ label: shorten(item), children: [] }))
    }))
    .filter((bucket) => bucket.children.length);
  return { label: shorten(root), children: children.length ? children : [{ label: 'Main ideas', children: [{ label: shorten(clean), children: [] }] }] };
}

function shorten(text) {
  const words = text.replace(/[-*#]/g, '').trim().split(/\s+/).slice(0, 5);
  return words.join(' ') || 'New idea';
}

function nanoSlug() {
  return Math.random().toString(36).slice(2, 10);
}

function getDescendants(id, edges) {
  const children = edges.filter((edge) => edge.source === id).map((edge) => edge.target);
  return children.flatMap((child) => [child, ...getDescendants(child, edges)]);
}

function selectMap(state) {
  return state.maps.find((map) => map.id === state.activeMapId) ?? state.maps[0];
}

function App() {
  const route = useClaspStore((state) => state.route);
  if (route === '/') return <Landing />;
  if (route === '/auth') return <Auth />;
  if (route === '/onboarding') return <Onboarding />;
  if (route === '/dashboard') return <Dashboard />;
  if (route.startsWith('/map/')) return <Editor />;
  if (route.startsWith('/m/')) return <PublicMap />;
  if (route === '/upgrade') return <Upgrade />;
  return <Landing />;
}

function Landing() {
  const navigate = useClaspStore((state) => state.navigate);
  return (
    <main className="page landing">
      <nav className="nav">
        <Logo />
        <button className="ghost" onClick={() => navigate('/auth')}><LogIn size={18} /> Sign in</button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Messy notes, clean maps</p>
          <h1>Clasp turns scattered thoughts into a living outline.</h1>
          <p>Paste your chaos, watch a connected map form, then edit the map and outline from one source of truth.</p>
          <button className="primary large" onClick={() => navigate('/auth')}><Sparkles size={20} /> Start for free</button>
        </div>
        <HeroAnimation />
      </section>
      <section className="feature-strip">
        <Feature icon={<GitBranch />} title="Map first" text="Branches stay visual, editable, and easy to rearrange." />
        <Feature icon={<PanelRight />} title="Outline beside it" text="Every node becomes a studyable, structured panel." />
        <Feature icon={<Zap />} title="Fast capture" text="Manual maps and AI clustering share the same editor." />
      </section>
      <Pricing compact />
    </main>
  );
}

function Auth() {
  const navigate = useClaspStore((state) => state.navigate);
  return (
    <main className="auth-page">
      <Logo />
      <section className="auth-box">
        <h1>Welcome to Clasp</h1>
        <p>Your maps are saved to your account.</p>
        <button className="primary large" onClick={() => navigate('/onboarding')}><LogIn size={20} /> Continue with Google</button>
      </section>
    </main>
  );
}

function Onboarding() {
  const completeOnboarding = useClaspStore((state) => state.completeOnboarding);
  const navigate = useClaspStore((state) => state.navigate);
  const [topic, setTopic] = useState('');
  return (
    <main className="onboarding">
      <button className="ghost skip" onClick={() => navigate('/dashboard')}>Skip</button>
      <HeroAnimation />
      <form className="onboarding-panel" onSubmit={(event) => { event.preventDefault(); completeOnboarding(topic); }}>
        <h1>What&apos;s on your mind right now?</h1>
        <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="A product idea, lecture topic, plot thread..." autoFocus />
        <button className="primary"><Plus size={18} /> Create center node</button>
      </form>
    </main>
  );
}

function Dashboard() {
  const maps = useClaspStore((state) => state.maps);
  const search = useClaspStore((state) => state.search);
  const setSearch = useClaspStore((state) => state.setSearch);
  const setModal = useClaspStore((state) => state.setModal);
  const openMap = useClaspStore((state) => state.openMap);
  const filtered = maps.filter((map) => map.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <main className="app-shell">
      <TopNav />
      <section className="dashboard-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your map library</h1>
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => setModal('convert')}><FileText size={18} /> Convert notes</button>
          <button className="primary" onClick={() => setModal('new-map')}><Plus size={18} /> New map</button>
        </div>
      </section>
      <label className="search">
        <Search size={18} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search maps" />
      </label>
      {filtered.length ? (
        <section className="map-grid">
          {filtered.map((map) => <MapCard key={map.id} map={map} onOpen={() => openMap(map.id)} />)}
        </section>
      ) : (
        <section className="empty-state">
          <HeroAnimation small />
          <h2>Your first map is waiting.</h2>
          <button className="primary" onClick={() => setModal('new-map')}><Plus size={18} /> Create one</button>
        </section>
      )}
      <Modals />
    </main>
  );
}

function Editor() {
  const map = useClaspStore(selectMap);
  const navigate = useClaspStore((state) => state.navigate);
  const saveStatus = useClaspStore((state) => state.saveStatus);
  const updateMapTitle = useClaspStore((state) => state.updateMapTitle);
  const setModal = useClaspStore((state) => state.setModal);
  return (
    <main className="editor">
      <header className="editor-top">
        <button className="icon-btn" onClick={() => navigate('/dashboard')} title="Back"><ArrowLeft size={20} /></button>
        <input className="title-input" value={map.title} onChange={(event) => updateMapTitle(event.target.value)} />
        <button className="secondary" onClick={() => setModal('share')}><Share2 size={18} /> Share</button>
        <span className={`save ${saveStatus === 'Saved' ? 'ok' : ''}`}>{saveStatus === 'Saving...' && <Loader2 className="spin" size={15} />}{saveStatus}</span>
      </header>
      <section className="editor-body">
        <MapCanvas map={map} />
        <OutlinePanel map={map} />
      </section>
      <BottomBar />
      <Modals />
    </main>
  );
}

function PublicMap() {
  const map = useClaspStore((state) => state.maps.find((item) => item.isPublic) ?? state.maps[0]);
  const navigate = useClaspStore((state) => state.navigate);
  return (
    <main className="editor public">
      <header className="editor-top">
        <Logo />
        <button className="primary" onClick={() => navigate('/auth')}>Start for free</button>
      </header>
      <MapCanvas map={map} readOnly />
    </main>
  );
}

function Upgrade() {
  const upgrade = useClaspStore((state) => state.upgrade);
  return (
    <main className="page">
      <TopNav />
      <section className="upgrade-head">
        <p className="eyebrow">Upgrade</p>
        <h1>Keep building when the map gets bigger.</h1>
      </section>
      <Pricing onChoose={upgrade} />
    </main>
  );
}

function MapCanvas({ map, readOnly = false }) {
  const selectedNodeId = useClaspStore((state) => state.selectedNodeId);
  const focusedNodeId = useClaspStore((state) => state.focusedNodeId);
  const focusMode = useClaspStore((state) => state.focusMode);
  const setSelectedNode = useClaspStore((state) => state.setSelectedNode);
  const addNode = useClaspStore((state) => state.addNode);
  const moveNode = useClaspStore((state) => state.moveNode);
  const deleteNode = useClaspStore((state) => state.deleteNode);
  const visible = useMemo(() => new Set(focusedNodeId ? [focusedNodeId, ...getDescendants(focusedNodeId, map.content.edges)] : []), [focusedNodeId, map.content.edges]);
  const dragging = useRef(null);

  useEffect(() => {
    function onMove(event) {
      if (!dragging.current || readOnly) return;
      const { id, offsetX, offsetY } = dragging.current;
      const rect = document.querySelector('.canvas-stage')?.getBoundingClientRect();
      if (!rect) return;
      moveNode(id, { x: event.clientX - rect.left - offsetX, y: event.clientY - rect.top - offsetY });
    }
    function onUp() {
      dragging.current = null;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [moveNode, readOnly]);

  useEffect(() => {
    function onKey(event) {
      if (readOnly) return;
      if (event.key === 'Tab' && selectedNodeId) {
        event.preventDefault();
        addNode(selectedNodeId);
      }
      if ((event.key === 'Backspace' || event.key === 'Delete') && selectedNodeId) deleteNode(selectedNodeId);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addNode, deleteNode, readOnly, selectedNodeId]);

  return (
    <section className="canvas-wrap">
      {focusMode && focusedNodeId && !readOnly && (
        <button className="focus-back" onClick={() => useClaspStore.setState({ focusedNodeId: null })}><ArrowLeft size={17} /> Full map</button>
      )}
      <div className="canvas-stage">
        <svg className="edges" viewBox="0 0 1120 720" preserveAspectRatio="none">
          {map.content.edges.map((edge) => {
            const source = map.content.nodes.find((node) => node.id === edge.source);
            const target = map.content.nodes.find((node) => node.id === edge.target);
            if (!source || !target) return null;
            const muted = focusedNodeId && !visible.has(edge.source) && !visible.has(edge.target);
            const start = nodeAnchor(source, target);
            const end = nodeAnchor(target, source);
            const sourceAngle = source.data.isRoot ? target.data.angle ?? 0 : source.data.angle ?? 0;
            const vector = vectorFromAngle(sourceAngle);
            const c1 = { x: start.x + vector.x * 92, y: start.y + vector.y * 64 };
            const c2 = { x: end.x - vector.x * 92, y: end.y - vector.y * 64 };
            return <path key={edge.id} className={muted ? 'muted' : ''} d={`M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`} stroke={edge.colour || target.data.colour} />;
          })}
        </svg>
        {map.content.nodes.map((node) => {
          const muted = focusedNodeId && !visible.has(node.id);
          return (
            <button
              key={node.id}
              className={`node side-${node.data.side || 'right'} ${node.id === selectedNodeId ? 'selected' : ''} ${muted ? 'muted' : ''}`}
              style={{ left: node.position.x, top: node.position.y, '--branch': node.data.colour }}
              onMouseDown={(event) => {
                if (readOnly) return;
                dragging.current = { id: node.id, offsetX: event.nativeEvent.offsetX, offsetY: event.nativeEvent.offsetY };
              }}
              onClick={() => setSelectedNode(node.id)}
            >
              <span>{node.data.label}</span>
              {!readOnly && <i onClick={(event) => { event.stopPropagation(); addNode(node.id); }}><Plus size={14} /></i>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function OutlinePanel({ map }) {
  const selectedNodeId = useClaspStore((state) => state.selectedNodeId);
  const setSelectedNode = useClaspStore((state) => state.setSelectedNode);
  const updateNodeLabel = useClaspStore((state) => state.updateNodeLabel);
  const tree = buildOutline(map.content.nodes, map.content.edges);
  return (
    <aside className="outline">
      <header>
        <p className="eyebrow">Live outline</p>
        <h2>{map.title}</h2>
      </header>
      <div className="outline-list">
        {tree.map((item) => (
          <OutlineItem
            key={item.id}
            item={item}
            level={0}
            selectedNodeId={selectedNodeId}
            setSelectedNode={setSelectedNode}
            updateNodeLabel={updateNodeLabel}
          />
        ))}
      </div>
    </aside>
  );
}

function OutlineItem({ item, level, selectedNodeId, setSelectedNode, updateNodeLabel }) {
  return (
    <>
      <label className={`outline-item ${selectedNodeId === item.id ? 'active' : ''}`} style={{ '--level': level, '--branch': item.colour }}>
        <ChevronRight size={15} />
        <input value={item.label} onFocus={() => setSelectedNode(item.id)} onChange={(event) => updateNodeLabel(item.id, event.target.value)} />
      </label>
      {item.children.map((child) => (
        <OutlineItem key={child.id} item={child} level={level + 1} selectedNodeId={selectedNodeId} setSelectedNode={setSelectedNode} updateNodeLabel={updateNodeLabel} />
      ))}
    </>
  );
}

function buildOutline(nodes, edges) {
  const byId = new Map(nodes.map((node) => [node.id, { id: node.id, label: node.data.label, colour: node.data.colour, children: [] }]));
  edges.forEach((edge) => byId.get(edge.source)?.children.push(byId.get(edge.target)));
  return [byId.get('node_root')].filter(Boolean);
}

function BottomBar() {
  const toggleFocusMode = useClaspStore((state) => state.toggleFocusMode);
  const focusMode = useClaspStore((state) => state.focusMode);
  return (
    <footer className="bottom-bar">
      <button className="icon-btn" title="Zoom in"><ZoomIn size={19} /></button>
      <button className="icon-btn" title="Zoom out"><ZoomOut size={19} /></button>
      <button className="secondary"><MousePointer2 size={17} /> Fit view</button>
      <button className={focusMode ? 'primary' : 'secondary'} onClick={toggleFocusMode}><Focus size={17} /> Focus</button>
    </footer>
  );
}

function buildMiniPath(map, edge, index) {
  const source = map.content.nodes.find((node) => node.id === edge.source);
  const target = map.content.nodes.find((node) => node.id === edge.target);
  if (!source || !target) return null;
  const sourceX = source.position.x / 5;
  const targetX = target.position.x / 5;
  const mid = (sourceX + targetX) / 2;
  return <path key={edge.id} d={`M ${sourceX} ${source.position.y / 5 + index} C ${mid} ${source.position.y / 5}, ${mid} ${target.position.y / 5}, ${targetX} ${target.position.y / 5}`} />;
}

function MapCard({ map, onOpen }) {
  return (
    <article className="map-card" onClick={onOpen}>
      <div className="thumb">
        <svg viewBox="0 0 220 150">
          {map.content.edges.slice(0, 7).map((edge, index) => buildMiniPath(map, edge, index))}
          {map.content.nodes.slice(0, 8).map((node) => <circle key={node.id} cx={node.position.x / 5} cy={node.position.y / 5} r={node.data.isRoot ? 8 : 5} />)}
        </svg>
      </div>
      <div className="card-row">
        <div>
          <h2>{map.title}</h2>
          <p>Edited {new Date(map.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
        </div>
        <button className="icon-btn" title="More"><MoreHorizontal size={18} /></button>
      </div>
    </article>
  );
}

function Modals() {
  const modal = useClaspStore((state) => state.modal);
  const setModal = useClaspStore((state) => state.setModal);
  if (!modal) return null;
  return (
    <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
        {modal === 'new-map' && <NewMapModal />}
        {modal === 'convert' && <ConvertModal />}
        {modal === 'share' && <ShareModal />}
        {modal === 'node-limit' && <LimitModal />}
      </div>
    </div>
  );
}

function NewMapModal() {
  const createMap = useClaspStore((state) => state.createMap);
  const [topic, setTopic] = useState('');
  return (
    <form onSubmit={(event) => { event.preventDefault(); createMap(topic); }}>
      <h2>What&apos;s your map about?</h2>
      <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Research plan, novel arc, launch checklist..." autoFocus />
      <button className="primary"><Plus size={18} /> Create map</button>
    </form>
  );
}

function ConvertModal() {
  const generateMap = useClaspStore((state) => state.generateMap);
  const aiMapCount = useClaspStore((state) => state.aiMapCount);
  const navigate = useClaspStore((state) => state.navigate);
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState('');
  const blocked = aiMapCount >= 2;
  return blocked ? (
    <div>
      <h2>You&apos;ve used your free AI maps.</h2>
      <p>Manual maps stay unlimited, and paid plans unlock more clustering.</p>
      <button className="primary" onClick={() => navigate('/upgrade')}><Lock size={18} /> Upgrade</button>
    </div>
  ) : (
    <form onSubmit={(event) => { event.preventDefault(); generateMap(notes, context); }}>
      <h2>Convert notes</h2>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste the messy version here..." autoFocus />
      <input value={context} onChange={(event) => setContext(event.target.value)} placeholder="What is this about? Optional" />
      <button className="primary" disabled={!notes.trim()}><Sparkles size={18} /> Generate map</button>
    </form>
  );
}

function ShareModal() {
  const map = useClaspStore(selectMap);
  const toggleShare = useClaspStore((state) => state.toggleShare);
  const navigate = useClaspStore((state) => state.navigate);
  const url = `https://clasp.vercel.app/m/${map.publicSlug || 'preview'}`;
  return (
    <div>
      <h2>Share map</h2>
      <p>Anyone with the link can view this map without an account.</p>
      <button className={map.isPublic ? 'secondary' : 'primary'} onClick={toggleShare}><Link size={18} /> {map.isPublic ? 'Turn off public link' : 'Generate public link'}</button>
      {map.isPublic && (
        <div className="copy-box">
          <input value={url} readOnly />
          <button className="icon-btn" title="Copy"><Copy size={18} /></button>
          <button className="secondary" onClick={() => navigate(`/m/${map.publicSlug}`)}>Preview</button>
        </div>
      )}
    </div>
  );
}

function LimitModal() {
  const navigate = useClaspStore((state) => state.navigate);
  return (
    <div>
      <h2>You&apos;ve reached the free limit.</h2>
      <p>Existing nodes are safe. Upgrade to keep adding branches.</p>
      <button className="primary" onClick={() => navigate('/upgrade')}><Lock size={18} /> Upgrade</button>
    </div>
  );
}

function HeroAnimation({ small = false }) {
  return (
    <div className={`hero-animation ${small ? 'small' : ''}`}>
      <div className="note note-a">lecture fragments</div>
      <div className="note note-b">pricing idea</div>
      <div className="note note-c">plot thread</div>
      <div className="anim-map">
        <span className="root-dot" />
        <span className="branch b1" />
        <span className="branch b2" />
        <span className="branch b3" />
      </div>
      <div className="anim-panel">
        <i /><i /><i /><i />
      </div>
    </div>
  );
}

function Pricing({ compact = false, onChoose }) {
  const navigate = useClaspStore((state) => state.navigate);
  const choose = onChoose || ((plan) => plan === 'free' ? navigate('/auth') : navigate('/upgrade'));
  const plans = [
    ['Free', '₹0', '2 AI maps ever', '150 lifetime nodes', 'No sharing'],
    ['Casual', '₹99', '10 AI maps monthly', 'Unlimited nodes', 'Shareable links'],
    ['Pro', '₹199', 'Unlimited AI maps', 'Unlimited nodes', 'Exports in V2']
  ];
  return (
    <section className={`pricing ${compact ? 'compact' : ''}`}>
      {plans.map(([name, price, ai, nodes, share]) => (
        <article key={name} className={name === 'Casual' ? 'featured' : ''}>
          <h2>{name}</h2>
          <strong>{price}<span>/month</span></strong>
          <p>{ai}</p>
          <p>{nodes}</p>
          <p>{share}</p>
          <button className={name === 'Casual' ? 'primary' : 'secondary'} onClick={() => choose(name.toLowerCase())}>{name === 'Free' ? 'Start' : 'Choose'}</button>
        </article>
      ))}
    </section>
  );
}

function Feature({ icon, title, text }) {
  return <article>{React.cloneElement(icon, { size: 22 })}<h2>{title}</h2><p>{text}</p></article>;
}

function TopNav() {
  const navigate = useClaspStore((state) => state.navigate);
  return (
    <nav className="nav app-nav">
      <Logo />
      <div>
        <button className="ghost" onClick={() => navigate('/dashboard')}><LayoutDashboard size={18} /> Dashboard</button>
        <button className="ghost" onClick={() => navigate('/upgrade')}>Upgrade</button>
      </div>
    </nav>
  );
}

function Logo() {
  return <button className="logo" onClick={() => useClaspStore.getState().navigate('/')}><span /> Clasp</button>;
}

createRoot(document.getElementById('root')).render(<App />);
