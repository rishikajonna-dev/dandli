// src/features/maps/mapService.js

import { supabase } from "../../lib/supabase";

function requireUserId(userId) {
    if (!userId) {
        throw new Error("A signed-in user is required to access maps.");
    }
    return userId;
}

export async function createMap(userId, map) {
    const ownerId = requireUserId(userId);
    const finalTitle = typeof map?.title === 'string' && map.title.trim()
        ? map.title.trim()
        : 'Untitled Map';

    const { data, error } = await supabase
        .from("maps")
        .insert({
            user_id: ownerId,
            title: finalTitle,
            data: { ...map, title: finalTitle },
        })
        .select();

    if (error) {
        throw error;
    }

    return data?.[0];
}

export async function getMap(userId, id) {
    const ownerId = requireUserId(userId);
    const { data, error } = await supabase
        .from("maps")
        .select("*")
        .eq("id", id)
        .eq("user_id", ownerId)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getUserMaps(userId) {
    const ownerId = requireUserId(userId);
    const { data, error } = await supabase
        .from("maps")
        .select("*")
        .eq("user_id", ownerId)
        .order("updated_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

export async function updateMap(userId, id, map) {
    const ownerId = requireUserId(userId);
    const finalTitle = typeof map?.title === 'string' && map.title.trim()
        ? map.title.trim()
        : 'Untitled Map';

    const { data, error } = await supabase
        .from("maps")
        .update({
            title: finalTitle,
            data: { ...map, title: finalTitle },
        })
        .eq("id", id)
        .eq("user_id", ownerId)
        .select();

    if (error) {
        throw error;
    }

    return data?.[0];
}

export async function deleteMap(userId, id) {
    const ownerId = requireUserId(userId);
    const { error } = await supabase
        .from("maps")
        .delete()
        .eq("id", id)
        .eq("user_id", ownerId);

    if (error) {
        throw error;
    }
}
