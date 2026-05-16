import { useCallback, useState } from 'react';

const minZoom = 0.34;
const maxZoom = 1.85;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function useZoomPan(initial = { zoom: 0.82, panX: 0, panY: 0 }) {
  const [zoom, setZoom] = useState(initial.zoom);
  const [pan, setPan] = useState({ x: initial.panX, y: initial.panY });
  const [drag, setDrag] = useState(null);

  const onWheel = useCallback((event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const nextZoom = clamp(zoom * (event.deltaY > 0 ? 0.92 : 1.08), minZoom, maxZoom);
    const ratio = nextZoom / zoom;

    setPan((current) => ({
      x: pointerX - (pointerX - current.x) * ratio,
      y: pointerY - (pointerY - current.y) * ratio
    }));
    setZoom(nextZoom);
  }, [zoom]);

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0 || event.target.closest?.('[data-node-card]')) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ pointerId: event.pointerId, x: event.clientX, y: event.clientY, pan });
  }, [pan]);

  const onPointerMove = useCallback((event) => {
    if (!drag) return;
    setPan({
      x: drag.pan.x + event.clientX - drag.x,
      y: drag.pan.y + event.clientY - drag.y
    });
  }, [drag]);

  const onPointerUp = useCallback((event) => {
    if (drag?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDrag(null);
    }
  }, [drag]);

  const zoomIn = useCallback(() => setZoom((value) => clamp(value * 1.12, minZoom, maxZoom)), []);
  const zoomOut = useCallback(() => setZoom((value) => clamp(value / 1.12, minZoom, maxZoom)), []);
  const reset = useCallback(() => {
    setZoom(initial.zoom);
    setPan({ x: initial.panX, y: initial.panY });
  }, [initial.panX, initial.panY, initial.zoom]);

  return {
    zoom,
    panX: pan.x,
    panY: pan.y,
    isPanning: Boolean(drag),
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
    reset,
    handlers: {
      onWheel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp
    }
  };
}
