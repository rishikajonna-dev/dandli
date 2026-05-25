import { useCallback, useMemo, useState } from 'react';

export function useHistory(initialPresent) {
  const [state, setState] = useState({
    past: [],
    present: initialPresent,
    future: []
  });

  const setPresent = useCallback((updater) => {
    setState((current) => {
      const nextPresent = typeof updater === 'function' ? updater(current.present) : updater;
      if (Object.is(nextPresent, current.present)) return current;
      return {
        past: [...current.past, current.present].slice(-80),
        present: nextPresent,
        future: []
      };
    });
  }, []);

  const replacePresent = useCallback((updater) => {
    setState((current) => {
      const nextPresent = typeof updater === 'function' ? updater(current.present) : updater;
      if (Object.is(nextPresent, current.present)) return current;
      return {
        ...current,
        present: nextPresent
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      if (!current.past.length) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (!current.future.length) return current;
      const next = current.future[0];
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1)
      };
    });
  }, []);

  return useMemo(() => ({
    past: state.past,
    present: state.present,
    future: state.future,
    setPresent,
    replacePresent,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  }), [redo, replacePresent, setPresent, state.future, state.past, state.present, undo]);
}
