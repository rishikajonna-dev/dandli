import { useEffect, useRef } from 'react';

export function useKeyboardShortcuts(actions, enabled = true) {
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(event) {
      const target = event.target;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target?.tagName) || target?.isContentEditable;

      if (isInput && event.key !== 'Escape') return;

      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        actionsRef.current.redo?.();
        return;
      }

      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        actionsRef.current.undo?.();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        actionsRef.current.addChild?.();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          actionsRef.current.addSibling?.();
        } else {
          actionsRef.current.rename?.();
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        actionsRef.current.deleteNode?.();
      } else if (event.key === ' ') {
        event.preventDefault();
        actionsRef.current.toggleCollapse?.();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        actionsRef.current.escape?.();
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        actionsRef.current.zoomIn?.();
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        actionsRef.current.zoomOut?.();
      } else if (event.key === '0') {
        event.preventDefault();
        actionsRef.current.fit?.();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
