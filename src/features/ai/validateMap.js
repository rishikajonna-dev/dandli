// src/features/ai/validateMap.js

function validateNode(node, path = "root") {
    if (!node || typeof node !== "object") {
        throw new Error(`Invalid node at ${path}: node must be an object.`);
    }

    if (typeof node.text !== "string") {
        throw new Error(`Invalid node at ${path}: "text" must be a string.`);
    }

    if (!Array.isArray(node.children)) {
        throw new Error(`Invalid node at ${path}: "children" must be an array.`);
    }

    for (let i = 0; i < node.children.length; i++) {
        validateNode(node.children[i], `${path}.children[${i}]`);
    }
}

export function validateMap(map) {
    validateNode(map);
    return true;
}