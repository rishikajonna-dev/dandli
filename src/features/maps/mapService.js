// src/features/maps/mapService.js

import { supabase } from "../../lib/supabase";

async function requireSignedInUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) {
        throw new Error("A signed-in user is required to access maps.");
    }
    return data.user.id;
}

export async function createMap(_userId, map) {
    const ownerId = await requireSignedInUserId();
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

export async function getMap(_userId, id) {
    const ownerId = await requireSignedInUserId();
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

export async function getUserMaps(_userId) {
    const ownerId = await requireSignedInUserId();
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

export async function updateMap(_userId, id, map) {
    const ownerId = await requireSignedInUserId();
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

export async function deleteMap(_userId, id) {
    const ownerId = await requireSignedInUserId();
    const { error } = await supabase
        .from("maps")
        .delete()
        .eq("id", id)
        .eq("user_id", ownerId);

    if (error) {
        throw error;
    }
}
