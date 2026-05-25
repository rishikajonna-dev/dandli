// src/features/ai/generateMindMap.js

import { supabase } from "../../lib/supabase";

export async function generateMindMap(notes) {
    if (!notes?.trim()) {
        throw new Error("Please enter some notes.");
    }

    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (!accessToken) {
        throw new Error("Please sign in before generating a map.");
    }

    const response = await fetch("/api/generate-mind-map", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            notes,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error || "AI generation failed.");
    }

    return payload.map;
}
