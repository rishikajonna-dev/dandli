import { useEffect } from 'react';

export function useKeyboardShortcuts(actions, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(event) {
      const target = event.target;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target?.tagName) || target?.isContentEditable;

      if (isInput && event.key !== 'Escape') return;

      const modifier = event.ctrlKey || event.metaKey;

      if (modifier && event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        actions.redo?.();
        return;
      }

      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        actions.undo?.();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        actions.addChild?.();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.addSibling?.();
        } else {
          actions.rename?.();
        }
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        actions.deleteNode?.();
      } else if (event.key === ' ') {
        event.preventDefault();
        actions.toggleCollapse?.();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        actions.escape?.();
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        actions.zoomIn?.();
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        actions.zoomOut?.();
      } else if (event.key === '0') {
        event.preventDefault();
        actions.fit?.();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions, enabled]);
}
