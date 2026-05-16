import React, { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './Dashboard.jsx';
import { Workspace } from './Workspace.jsx';
import { useHistory } from '../hooks/useHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { createEmptyMap, createMockAiMap, sampleMap } from '../data/sampleMap.js';

function decodeSharedMap() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('share');
  if (!encoded) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

function createInitialState(stored) {
  const shared = decodeSharedMap();
  if (shared) {
    return {
      maps: [shared],
      activeMapId: shared.id,
      selectedNodeId: shared.root.id,
      focusNodeId: null,
      editingNodeId: null,
      collapsedNodeIds: [],
      expandedOverflow: [],
      totalNodesLifetime: 1,
      aiMapCount: 0
    };
  }

  return stored ?? {
    maps: [sampleMap],
    activeMapId: sampleMap.id,
    selectedNodeId: sampleMap.root.id,
    focusNodeId: null,
    editingNodeId: null,
    collapsedNodeIds: [],
    expandedOverflow: [],
    totalNodesLifetime: 1,
    aiMapCount: 0
  };
}

export default function App() {
  const [storedState, setStoredState] = useLocalStorage('clasp-app-state', null);
  const history = useHistory(createInitialState(storedState));
  const [route, setRoute] = useState(decodeSharedMap() ? 'workspace' : 'dashboard');
  const [convertOpen, setConvertOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('clasp-onboarded') !== 'true' && !decodeSharedMap());
  const readOnly = Boolean(decodeSharedMap());

  useEffect(() => {
    if (!readOnly) setStoredState(history.present);
  }, [history.present, readOnly, setStoredState]);

  useEffect(() => {
    if (!showOnboarding) return undefined;
    const timer = setTimeout(() => {
      localStorage.setItem('clasp-onboarded', 'true');
      setShowOnboarding(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showOnboarding]);

  const activeMap = useMemo(() => {
    return history.present.maps.find((map) => map.id === history.present.activeMapId) ?? history.present.maps[0];
  }, [history.present]);

  function openMap(id) {
    const map = history.present.maps.find((item) => item.id === id);
    history.replacePresent((current) => ({
      ...current,
      activeMapId: id,
      selectedNodeId: map?.root.id ?? 'root',
      focusNodeId: null,
      editingNodeId: null
    }));
    setRoute('workspace');
  }

  function createMap() {
    const title = window.prompt('Map title');
    if (!title?.trim()) return;
    const map = createEmptyMap(title.trim());
    history.setPresent((current) => ({
      ...current,
      maps: [map, ...current.maps],
      activeMapId: map.id,
      selectedNodeId: map.root.id,
      focusNodeId: null,
      editingNodeId: null
    }));
    setRoute('workspace');
  }

  function generateMap() {
    if ((history.present.aiMapCount ?? 0) >= 2) {
      setUpgradeMessage('Free plan includes 2 AI-generated maps ever.');
      return;
    }
    const map = createMockAiMap(notes, context);
    history.setPresent((current) => ({
      ...current,
      maps: [map, ...current.maps],
      activeMapId: map.id,
      selectedNodeId: map.root.id,
      focusNodeId: null,
      editingNodeId: null,
      aiMapCount: (current.aiMapCount ?? 0) + 1
    }));
    setNotes('');
    setContext('');
    setConvertOpen(false);
    setRoute('workspace');
  }

  return (
    <main className="app-root">
      {route === 'dashboard' && !readOnly ? (
        <Dashboard
          maps={history.present.maps}
          onOpenMap={openMap}
          onNewMap={createMap}
          onConvertNotes={() => setConvertOpen(true)}
        />
      ) : (
        <Workspace
          appState={history.present}
          setAppState={history.setPresent}
          replaceAppState={history.replacePresent}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          undo={history.undo}
          redo={history.redo}
          readOnly={readOnly}
          onBack={() => setRoute('dashboard')}
          onUpgradeNeeded={setUpgradeMessage}
        />
      )}

      {convertOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Convert Notes</h2>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste messy notes, research, ideas..." />
            <input value={context} onChange={(event) => setContext(event.target.value)} placeholder="Optional context or title" />
            <div className="modal-actions">
              <button type="button" className="secondary-action" onClick={() => setConvertOpen(false)}>Cancel</button>
              <button type="button" className="primary-action" onClick={generateMap}>Generate Map</button>
            </div>
          </div>
        </div>
      )}

      {upgradeMessage && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal small">
            <h2>Upgrade needed</h2>
            <p>{upgradeMessage}</p>
            <button type="button" className="primary-action" onClick={() => setUpgradeMessage('')}>Got it</button>
          </div>
        </div>
      )}

      {showOnboarding && (
        <div className="onboarding-layer">
          <div className="onboarding-card">
            <p className="eyebrow">Welcome to CLASP</p>
            <h2>What’s on your mind right now?</h2>
            <p>Drop the messy thought. Clasp will help turn it into structure.</p>
            <button type="button" className="primary-action" onClick={() => {
              localStorage.setItem('clasp-onboarded', 'true');
              setShowOnboarding(false);
              setConvertOpen(true);
            }}>Start with notes</button>
            <button type="button" className="secondary-action" onClick={() => {
              localStorage.setItem('clasp-onboarded', 'true');
              setShowOnboarding(false);
            }}>Skip intro</button>
          </div>
        </div>
      )}
    </main>
  );
}
