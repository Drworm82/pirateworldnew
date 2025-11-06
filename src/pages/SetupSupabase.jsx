// src/pages/SetupSupabase.jsx
import { useState, useEffect } from "react";
import { isConfigured, saveRuntimeEnv } from "../lib/supaApi";

export default function SetupSupabase() {
  const [url, setUrl] = useState(localStorage.getItem("VITE_SUPABASE_URL") || "");
  const [key, setKey] = useState(localStorage.getItem("VITE_SUPABASE_ANON_KEY") || "");
  const [ok, setOk] = useState(isConfigured());
  const [msg, setMsg] = useState("");

  useEffect(() => setOk(isConfigured()), []);

  function handleSave(e) {
    e.preventDefault();
    if (!/^https?:\/\//.test(url) || key.trim().length < 20) {
      setMsg("❗ Revisa URL (https://...) y Anon Key.");
      return;
    }
    saveRuntimeEnv(url.trim(), key.trim());
    setOk(true);
    setMsg("✅ Configuración guardada en este dispositivo.");
  }

  return (
    <div className="card">
      <h2>Configurar Supabase</h2>
      <p className="muted">Guarda <code>URL</code> y <code>anon key</code> para usar la API.</p>
      <form onSubmit={handleSave} className="form">
        <label>
          Supabase URL
          <input type="url" placeholder="https://xxxx.supabase.co" value={url} onChange={(e)=>setUrl(e.target.value)} required/>
        </label>
        <label>
          Supabase Anon Key
          <input type="text" placeholder="eyJhbGciOi..." value={key} onChange={(e)=>setKey(e.target.value)} required/>
        </label>
        <button className="btn" type="submit">💾 Guardar</button>
      </form>
      <p className={ok ? "ok" : "warn"}>{ok ? "✅ Supabase listo." : "⚠️ Aún no configurado."}</p>
      {msg && <div className="note">{msg}</div>}
    </div>
  );
}
