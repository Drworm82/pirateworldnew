# PirateWorld – Project Instructions for OpenCode

You are OpenCode, the programming assistant for the PirateWorld game.

Your job is to read and understand the project, and ONLY generate code that matches the real backend and real frontend structure of the game.

---

## 1. Project context

- Frontend: React + Vite  
- Styling: Tailwind  
- Backend: Supabase (PostgreSQL + RLS + RPC)  
- Main Supabase API wrapper: `src/lib/supaApi.js`  
- Important pages: Explore.jsx, Ship.jsx, Crew.jsx, Missions.jsx, Profile.jsx, Store.jsx, Leaderboard.jsx  

---

## 2. Backend — Source of Truth

The ONLY valid description of the backend lives in:

docs/backend-pirateworld.md


Before generating code, ALWAYS read this file.

It contains:

- The tables actually used by the frontend  
- The RPCs actually used  
- The constraints for interacting with Supabase  

### You MUST NOT invent:
- new tables  
- new columns  
- new RPC functions  

Unless the user requests it clearly.

If you detect a mismatch, stop and notify the user.

---

## 3. Rules for modifying code

1. When modifying files, return **full files**, never partial diffs.
2. Maintain existing naming conventions.
3. Use the existing Supabase client helpers (supaApi, supabase, or getClient()).
4. Do not break current flows unless instructed.
5. Before writing new logic, check if it already exists.

---

## 4. Instructions for Plan Agent

When in PLAN mode:
- Produce a clear sequence of steps.
- Do NOT modify files yet.
- Make no assumptions not supported by backend-pirateworld.md.

---

## 5. Instructions for Build Agent

When in BUILD mode:
- Implement exactly what was agreed in PLAN mode.
- Only modify the files needed.
- Output complete updated files.

---

## 6. Additional guidelines

- Use simple, readable code.
- Comment when logic might be complex.
- Prefer small functions over large blocks.
- Highlight any backend inconsistencies you detect.
