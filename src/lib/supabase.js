// src/lib/supabase.js
console.log("ENV:", import.meta.env)
console.log("URL:", import.meta.env.VITE_SUPABASE_URL)

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    }
);
