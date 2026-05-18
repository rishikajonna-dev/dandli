// src/features/maps/mapService.js

import { supabase } from "../../lib/supabase";

/**
 * Temporary implementation for development before Google Auth is added.
 * Uses a fixed test user ID so maps can be saved to Supabase.
 *
 * IMPORTANT:
 * Make sure this user exists in your `users` table:
 *
 * INSERT INTO users (id, email, full_name)
 * VALUES (
 *   '11111111-1111-1111-1111-111111111111',
 *   'test@example.com',
 *   'Test User'
 * )
 * ON CONFLICT (id) DO NOTHING;
 */

const TEST_USER_ID = "02c13471-13b1-4094-a23f-2f5062711a7a";

export async function createMap(map) {
    const { data, error } = await supabase
        .from("maps")
        .insert({
            user_id: TEST_USER_ID,
            title: map.title || "Untitled Map",
            data: map,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getMap(id) {
    const { data, error } = await supabase
        .from("maps")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getUserMaps() {
    const { data, error } = await supabase
        .from("maps")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

export async function updateMap(id, map) {
    const { data, error } = await supabase
        .from("maps")
        .update({
            title: map.title || "Untitled Map",
            data: map,
        })
        .eq("id", id)
        .eq("user_id", TEST_USER_ID)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deleteMap(id) {
    const { error } = await supabase
        .from("maps")
        .delete()
        .eq("id", id)
        .eq("user_id", TEST_USER_ID);

    if (error) {
        throw error;
    }
}