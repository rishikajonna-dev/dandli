export function exportJson(map) {
  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${map.title || 'clasp-map'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
