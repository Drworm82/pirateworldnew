// src/lib/supaClient.js
// Puente para código legado: reusa la configuración central en supaApi.
import { getClient } from "./supaApi";

const supabase = getClient(); // puede ser null si no hay URL/KEY
export default supabase;
