// src/features/ai/handleGenerateMap.js

import { generateMindMap } from "./generateMindMap";
import { validateMap } from "./validateMap";
import { createMapFromAi } from "./createMapFromAi";

/**
 * Generates a mind map from raw notes and returns a fully formed map object.
 *
 * Usage:
 * const newMap = await handleGenerateMap(notes);
 */
export async function handleGenerateMap(notes) {
    // 1. Call Groq
    const aiMap = await generateMindMap(notes);

    // 2. Validate AI output
    validateMap(aiMap);

    // 3. Convert to app schema
    const newMap = createMapFromAi(aiMap);

    // 4. Return ready-to-save map
    return newMap;
}