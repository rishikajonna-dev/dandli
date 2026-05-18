export function exportMarkdown(map) {
  if (!map || !map.root) return '';

  function getMarkdown(node, depth = 0) {
    if (!node) return '';
    const label = node.label ?? node.title ?? node.text ?? 'Untitled';
    
    if (depth === 0) {
      let result = `# ${label}\n\n`;
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => {
          result += getMarkdown(child, depth + 1);
        });
      }
      return result;
    } else {
      const indent = '  '.repeat(depth - 1);
      let result = `${indent}- ${label}\n`;
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => {
          result += getMarkdown(child, depth + 1);
        });
      }
      return result;
    }
  }

  return getMarkdown(map.root).trim() + '\n';
}
