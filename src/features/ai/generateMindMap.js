// src/features/ai/generateMindMap.js

import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function extractJson(text) {
    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

    return JSON.parse(cleaned);
}

export async function generateMindMap(notes) {
    if (!notes?.trim()) {
        throw new Error("Please enter some notes.");
    }

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Missing VITE_GROQ_API_KEY environment variable.");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: buildUserPrompt(notes),
                },
            ],
            response_format: {
                type: "json_object",
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("No content returned from Groq.");
    }

    return extractJson(content);
}