import React, { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './Dashboard.jsx';
import { Workspace } from './Workspace.jsx';
import { useHistory } from '../hooks/useHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { createEmptyMap, createMockAiMap, sampleMap } from '../data/sampleMap.js';
import { handleGenerateMap } from '../features/ai/handleGenerateMap.js';
import { createMap } from '../features/maps/mapService.js';

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
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
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

  async function handleCreateMap() {
    const title = 'Untitled Map';
    const newMap = createEmptyMap(title);
    try {
      const savedMap = await createMap(newMap);
      const dbMap = {
        ...newMap,
        id: savedMap.id
      };
      history.setPresent((current) => ({
        ...current,
        maps: [dbMap, ...current.maps],
        activeMapId: dbMap.id,
        selectedNodeId: dbMap.root.id,
        focusNodeId: null,
        editingNodeId: dbMap.root.id
      }));
      setRoute('workspace');
    } catch (err) {
      console.error('Error creating map in Supabase:', err);
      // Fallback to local map creation for robust UX / offline usage
      history.setPresent((current) => ({
        ...current,
        maps: [newMap, ...current.maps],
        activeMapId: newMap.id,
        selectedNodeId: newMap.root.id,
        focusNodeId: null,
        editingNodeId: newMap.root.id
      }));
      setRoute('workspace');
    }
  }

  async function generateMap() {
    if (!notes || !notes.trim()) {
      setError('Please enter some notes.');
      return;
    }

    if ((history.present.aiMapCount ?? 0) >= 2) {
      setUpgradeMessage('Free plan includes 2 AI-generated maps ever.');
      setConvertOpen(false);
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const newMap = await handleGenerateMap(notes);

      history.setPresent((current) => ({
        ...current,
        maps: [newMap, ...current.maps],
        activeMapId: newMap.id,
        selectedNodeId: newMap.root.id,
        focusNodeId: null,
        editingNodeId: newMap.root.id,
        aiMapCount: (current.aiMapCount ?? 0) + 1
      }));

      setNotes('');
      setContext('');
      setError('');
      setConvertOpen(false);
      setRoute('workspace');
    } catch (err) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setGenerating(false);
    }
  }

  function closeConvertModal() {
    setConvertOpen(false);
    setError('');
    setNotes('');
    setContext('');
  }

  return (
    <main className="app-root">
      {route === 'dashboard' && !readOnly ? (
        <Dashboard
          maps={history.present.maps}
          onOpenMap={openMap}
          onNewMap={handleCreateMap}
          onConvertNotes={() => { setError(''); setConvertOpen(true); }}
          onSyncMaps={(fetchedMaps) => {
            history.setPresent((current) => {
              const merged = [...current.maps];
              for (const map of fetchedMaps) {
                const index = merged.findIndex(m => m.id === map.id);
                if (index > -1) {
                  merged[index] = map;
                } else {
                  merged.push(map);
                }
              }
              return {
                ...current,
                maps: merged
              };
            });
          }}
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
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Paste messy notes, research, ideas..."
              disabled={generating}
            />
            <input
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Optional context or title"
              disabled={generating}
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={closeConvertModal}
                disabled={generating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={generateMap}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Map'}
              </button>
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
              setError('');
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
