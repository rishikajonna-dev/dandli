// src/features/ai/createMapFromAi.js

/**
 * Converts the AI response into your application's internal map schema.
 * The AI returns:
 * {
 *   text: "Root Topic",
 *   children: [...]
 * }
 *
 * Your app likely expects:
 * {
 *   id: "...",
 *   text: "...",
 *   children: [...]
 * }
 */

function generateId() {
    return crypto.randomUUID();
}

function convertNode(node) {
    return {
        id: generateId(),
        text: node.text,
        children: node.children.map(convertNode),
    };
}

export function createMapFromAi(aiMap) {
    return {
        id: generateId(),
        title: aiMap.text || "Untitled Map",
        root: convertNode(aiMap),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}