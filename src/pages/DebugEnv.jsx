// src/pages/DebugEnv.jsx
import React from "react";

export default function DebugEnv() {
  const url =
    import.meta.env.VITE_SUPABASE_URL_PROD ||
    import.meta.env.VITE_SUPABASE_URL ||
    "—";

  const keyRaw =
    import.meta.env.VITE_SUPABASE_ANON_KEY_PROD ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "—";

  const keyMasked =
    keyRaw && keyRaw !== "—"
      ? `${keyRaw.slice(0, 6)}…${keyRaw.slice(-4)}`
      : "—";

  return (
    <div style={{ padding: 16, color: "#e6edf3" }}>
      <h1>Debug Env</h1>
      <p style={{ opacity: 0.8 }}>
        (Este componente existe solo para evitar fallos de build si se importa.
        No es necesario en producción.)
      </p>
      <pre
        style={{
          background: "#0b1220",
          border: "1px solid #1f2937",
          borderRadius: 8,
          padding: 12,
          overflow: "auto",
        }}
      >
{JSON.stringify(
  {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: keyMasked,
  },
  null,
  2
)}
      </pre>
    </div>
  );
}
