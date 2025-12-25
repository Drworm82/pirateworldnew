// src/lib/supaClient.js
import { createClient } from "@supabase/supabase-js";

// 🔴 DEV FORZADO — Sprint 31
const SUPA_URL = "https://igigwtxsgccudwqngxsf.supabase.co";
const SUPA_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaWd3dHhzZ2NjdWR3cW5neHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjMyOTYsImV4cCI6MjA3NzMzOTI5Nn0.l24NG8gvuwymFkFn3gbBi9W93JFYnsdN-0DSyGNWnn8";

export const supabase = createClient(SUPA_URL, SUPA_KEY);
