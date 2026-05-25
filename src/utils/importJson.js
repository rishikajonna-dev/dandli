const MAX_DEPTH = 12;
const MAX_NODES = 500;
const MAX_LABEL_LENGTH = 160;

function validateNode(node, depth, stats) {
  if (!node || typeof node !== 'object') {
    throw new Error('Invalid CLASP map JSON');
  }
  if (depth > MAX_DEPTH) {
    throw new Error('Imported map is too deeply nested');
  }

  const label = node.label ?? node.title ?? node.text;
  if (typeof label !== 'string' || !label.trim() || label.length > MAX_LABEL_LENGTH) {
    throw new Error('Imported map contains an invalid node label');
  }
  if (!Array.isArray(node.children)) {
    throw new Error('Imported map contains invalid children');
  }

  stats.count += 1;
  if (stats.count > MAX_NODES) {
    throw new Error('Imported map has too many nodes');
  }

  node.children.forEach((child) => validateNode(child, depth + 1, stats));
}

function validateMap(parsed) {
  if (!parsed || typeof parsed !== 'object' || !parsed.root || typeof parsed.title !== 'string') {
    throw new Error('Invalid CLASP map JSON');
  }

  validateNode(parsed.root, 0, { count: 0 });
}

export function importJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        validateMap(parsed);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
