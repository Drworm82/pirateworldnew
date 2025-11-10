// src/lib/supaClient.js
import { createClient } from "@supabase/supabase-js";

const SUPA_URL =
  import.meta.env.VITE_SUPABASE_URL_PROD ||
  import.meta.env.VITE_SUPABASE_URL;

const SUPA_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY_PROD ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPA_URL || !SUPA_KEY) {
  console.error("❌ Variables de entorno de Supabase no configuradas.", {
    SUPA_URL,
    SUPA_KEY: SUPA_KEY ? "(set)" : undefined,
  });
  throw new Error("Supabase env not set");
}

export const supabase = createClient(SUPA_URL, SUPA_KEY);
