import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './LandingPage.jsx';
import { AuthPage } from './AuthPage.jsx';
import { Dashboard } from './Dashboard.jsx';
import { Workspace } from './Workspace.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useHistory } from '../hooks/useHistory.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { createMap, deleteMap, updateMap } from '../features/maps/mapService.js';
import { sampleMap } from '../data/sampleMap.js';
import { handleGenerateMap } from '../features/ai/handleGenerateMap.js';
import { FREE_PLAN_LIMITS, isAiGenerationAllowed } from '../features/billing/entitlements.js';

// The navigateTo function will be defined inside the App component after setRoute is available.

// Decode possible shared map from URL parameters
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

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  // Determine initial route based on URL and shared map
  const initialPath = window.location.pathname;
  const sharedMap = decodeSharedMap();
  const initialRoute = sharedMap
    ? '/workspace'
    : initialPath === '/'
    ? '/' // landing page
    : initialPath === '/app'
    ? '/app' // dashboard
    : initialPath === '/auth'
    ? '/auth' // auth page
    : '/app'; // fallback to dashboard

  const [route, setRoute] = useState(initialRoute);
  const navigateTo = useCallback((path) => {
    // Update browser history and route state
    window.history.pushState(null, '', path);
    setRoute(path);
  }, []);
  const [convertOpen, setConvertOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newMapTitle, setNewMapTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [storedState, setStoredState] = useLocalStorage('clasp-app-state', null);
  const history = useHistory(
    (() => {
      if (sharedMap) {
        return {
          maps: [sharedMap],
          activeMapId: sharedMap.id,
          selectedNodeId: sharedMap.root.id,
          focusNodeId: null,
          editingNodeId: null,
          collapsedNodeIds: [],
          expandedOverflow: [],
          totalNodesLifetime: 1,
          aiMapCount: 0,
        };
      }
      return storedState ?? {
        maps: [],
        activeMapId: null,
        selectedNodeId: null,
        focusNodeId: null,
        editingNodeId: null,
        collapsedNodeIds: [],
        expandedOverflow: [],
        totalNodesLifetime: 0,
        aiMapCount: 0,
      };
    })()
  );

  const readOnly = Boolean(sharedMap);

  // Persist state when not read‑only
  useEffect(() => {
    if (!readOnly) setStoredState(history.present);
  }, [history.present, readOnly, setStoredState]);

  // Update body class for styling
  useEffect(() => {
    const routeClass =
      route === '/app'
        ? 'route-dashboard'
        : route === '/workspace'
        ? 'route-workspace'
        : route === '/auth'
        ? 'route-auth'
        : 'route-landing';
    document.body.className = routeClass;
  }, [route]);

  // Browser back/forward handling
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setRoute(path);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sign‑out handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out error', e);
    }
    navigateTo('/auth');
  };

  // Navigation callback passed to child components
  const handleNavigate = (path) => navigateTo(path);

  // Open a map in workspace
  const openMap = (id) => {
    history.replacePresent((current) => {
      const map = current.maps.find((m) => m.id === id);
      return {
        ...current,
        activeMapId: id,
        selectedNodeId: map?.root?.id ?? 'root',
        focusNodeId: null,
        editingNodeId: null,
      };
    });
    navigateTo('/workspace');
  };

  // Sync maps from Supabase
  const handleSyncMaps = useCallback(
    (syncedMaps) => {
      history.replacePresent((current) => {
        const parsedMaps = (syncedMaps || []).map((m) => {
          const data = typeof m.data === 'string' ? JSON.parse(m.data) : m.data;
          const title = data?.title?.trim() || m.title?.trim() || 'Untitled Map';
          return { ...data, id: m.id, title, updatedAt: m.updated_at || data?.updatedAt || new Date().toISOString() };
        });
        return { ...current, maps: parsedMaps };
      });
    },
    [history.replacePresent]
  );

  // Create new map
  const handleCreateMap = async (customTitle) => {
    const id = crypto.randomUUID();
    const title = customTitle?.trim() || 'Untitled Map';
    const newMap = {
      id,
      title,
      root: { id: 'root', label: title, children: [], metadata: {}, collapsed: false, color: null },
      updatedAt: new Date().toISOString(),
      aiGenerated: false,
    };
    try {
      const saved = await createMap(user?.id, newMap);
      const dbMap = { ...newMap, id: saved.id };
      history.setPresent((c) => ({ ...c, maps: [dbMap, ...c.maps], activeMapId: dbMap.id, selectedNodeId: dbMap.root.id, editingNodeId: dbMap.root.id }));
    } catch (e) {
      console.error('Create map error', e);
      history.setPresent((c) => ({ ...c, maps: [newMap, ...c.maps], activeMapId: newMap.id, selectedNodeId: newMap.root.id, editingNodeId: newMap.root.id }));
    }
    navigateTo('/workspace');
  };

  // Create map from template
  const handleCreateMapFromTemplate = (template) => {
    const id = crypto.randomUUID();
    const newMap = {
      id,
      title: template.title,
      root: JSON.parse(JSON.stringify(template.root)),
      updatedAt: new Date().toISOString(),
      aiGenerated: false,
      isUnsavedTemplate: true, // Mark as unsaved template map
    };
    
    // Instantly transition local state for zero-latency exploration
    history.setPresent((c) => ({
      ...c,
      maps: [newMap, ...c.maps],
      activeMapId: newMap.id,
      selectedNodeId: newMap.root.id,
      editingNodeId: null,
    }));
    navigateTo('/workspace');
  };

  // Delete map
  const handleDeleteMap = async (id) => {
    try {
      await deleteMap(user?.id, id);
    } catch (e) {
      console.error('Delete map error', e);
    }
    history.setPresent((c) => ({
      ...c,
      maps: c.maps.filter((m) => m.id !== id),
      activeMapId: c.activeMapId === id ? c.maps.find((m) => m.id !== id)?.id ?? null : c.activeMapId,
    }));
  };

  // Rename map
  const handleRenameMap = async (id, newTitle) => {
    const title = newTitle?.trim() || 'Untitled Map';
    const existing = history.present.maps.find((m) => m.id === id);
    if (!existing) return;
    const updated = { ...existing, title, root: { ...existing.root, label: title }, updatedAt: new Date().toISOString() };
    try {
      await updateMap(user?.id, id, updated);
    } catch (e) {
      console.error('Rename map error', e);
    }
    history.setPresent((c) => ({ ...c, maps: c.maps.map((m) => (m.id === id ? updated : m)) }));
  };

  // Generate AI map
  const generateMap = async () => {
    if (!notes?.trim()) {
      setError('Please enter some notes.');
      return;
    }
    if (!isAiGenerationAllowed(history.present.aiMapCount ?? 0)) {
      setUpgradeMessage(`Free plan includes ${FREE_PLAN_LIMITS.aiMapsLifetime} AI-generated maps ever.`);
      setConvertOpen(false);
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const sourceNotes = context?.trim() ? `${context.trim()}\n\n${notes}` : notes;
      const generated = await handleGenerateMap(sourceNotes);
      const aiTitle = generated.root?.text || generated.root?.label || 'AI Mind Map';
      generated.title = aiTitle;
      if (generated.root) generated.root.label = aiTitle;
      let finalMap = generated;
      try {
        const saved = await createMap(user?.id, generated);
        finalMap = { ...generated, id: saved.id };
        if (finalMap.root) finalMap.root.label = aiTitle;
      } catch (e) {
        console.error('Save AI map error', e);
      }
      history.setPresent((c) => ({
        ...c,
        maps: [finalMap, ...c.maps],
        activeMapId: finalMap.id,
        selectedNodeId: finalMap.root.id,
        editingNodeId: finalMap.root.id,
        aiMapCount: (c.aiMapCount ?? 0) + 1,
      }));
      setNotes('');
      setContext('');
      setConvertOpen(false);
      navigateTo('/workspace');
    } catch (e) {
      setError(e.message || 'Error generating map');
    } finally {
      setGenerating(false);
    }
  };

  const closeConvertModal = () => {
    setConvertOpen(false);
    setError('');
    setNotes('');
    setContext('');
  };


  // Authentication redirect effect
  useEffect(() => {
    if (authLoading) return;

    const requiresAuth = !['/', '/auth'].includes(route) && !readOnly;

    if (requiresAuth && !user) {
      navigateTo('/auth');
      return;
    }

    if (route === '/auth' && user) {
      navigateTo('/app');
    }
  }, [authLoading, navigateTo, readOnly, route, user]);

  if (authLoading) {
    return <main className="app-root" />;
  }

  if (!['/', '/auth'].includes(route) && !readOnly && !user) {
    return <main className="app-root" />;
  }

// Render based on route
let mainContent;
if (route === '/' || route === '/auth') {
  mainContent = (
    <LandingPage onNavigate={handleNavigate} showAuth={route === '/auth'} />
  );
} else if (route === '/app' && !readOnly) {
    mainContent = (
      <Dashboard
        maps={history.present.maps}
        userId={user?.id}
        onOpenMap={openMap}
        onNewMap={() => {
          setNewMapTitle('');
          setCreateOpen(true);
        }}
        onSyncMaps={handleSyncMaps}
        onConvertNotes={() => {
          setError('');
          setConvertOpen(true);
        }}
        onDeleteMap={handleDeleteMap}
        onRenameMap={handleRenameMap}
        onSignOut={handleSignOut}
        onCreateMapFromTemplate={handleCreateMapFromTemplate}
      />
    );
  } else {
    // For workspace and any other routes
    mainContent = (
      <Workspace
        appState={history.present}
        setAppState={history.setPresent}
        replaceAppState={history.replacePresent}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        undo={history.undo}
        redo={history.redo}
        readOnly={readOnly}
        userId={user?.id}
        onBack={() => {
          // Remove any unsaved template maps when returning to dashboard
          history.setPresent((c) => ({
            ...c,
            maps: c.maps.filter((m) => !m.isUnsavedTemplate),
          }));
          navigateTo('/app');
        }}
        onUpgradeNeeded={setUpgradeMessage}
      />
    );
  }

  return (
    <main className="app-root">
      {mainContent}

      {/* Create Map Modal */}
      {createOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Create New Mind Map</h2>
            <input
              value={newMapTitle}
              onChange={(e) => setNewMapTitle(e.target.value)}
              placeholder="Enter a title for your mind map..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCreateOpen(false);
                  handleCreateMap(newMapTitle);
                }
              }}
            />
            <div className="modal-actions">
              <button type="button" className="secondary-action" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button type="button" className="primary-action" onClick={() => { setCreateOpen(false); handleCreateMap(newMapTitle); }}>
                Create Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Notes Modal */}
      {convertOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Convert Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste messy notes, research, ideas..."
              disabled={generating}
            />
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Optional context or title"
              disabled={generating}
            />
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-action" onClick={closeConvertModal} disabled={generating}>
                Cancel
              </button>
              <button type="button" className="primary-action" onClick={generateMap} disabled={generating}>
                {generating ? 'Generating...' : 'Generate Map'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Message Modal */}
      {upgradeMessage && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal small">
            <h2>Upgrade needed</h2>
            <p>{upgradeMessage}</p>
            <button type="button" className="primary-action" onClick={() => setUpgradeMessage('')}>
              Got it
            </button>
          </div>
        </div>
      )}


    </main>
  );
}
