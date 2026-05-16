import { useEffect, useState } from 'react';

export function useAutosave(key, payload, delay = 2000) {
  const [status, setStatus] = useState('Saved');

  useEffect(() => {
    setStatus('Unsaved');
    const timer = setTimeout(() => {
      setStatus('Saving...');
      try {
        localStorage.setItem(key, JSON.stringify(payload));
        setStatus('Saved');
      } catch {
        setStatus('Save failed');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, key, payload]);

  return status;
}
