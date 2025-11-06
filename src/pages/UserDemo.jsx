// src/pages/UserDemo.jsx
import { useState } from "react";
import { isConfigured, ensureUser } from "../lib/supaApi";

export default function UserDemo() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isConfigured()) {
    return (
      <div className="card">
        <h2>Demo usuario</h2>
        <p className="warn">⚠️ Supabase no está configurado.</p>
        <p className="muted">Ve a <a href="#/setup">Configuración</a> para guardar URL y Key.</p>
      </div>
    );
  }

  async function run() {
    setLoading(true);
    setOut(null);
    try {
      const res = await ensureUser(email.trim());
      setOut({ ok: true, data: res.user });
    } catch (err) {
      setOut({ ok: false, error: String(err?.message || err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Demo: ensureUser(email)</h2>
      <div className="form">
        <label>
          Email del jugador
          <input type="email" placeholder="pirata@mar.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </label>
        <button className="btn" onClick={run} disabled={loading || !email}>
          {loading ? "Ejecutando..." : "Crear / Cargar"}
        </button>
      </div>

      {out && (
        <pre className="pre">
{JSON.stringify(out, null, 2)}
        </pre>
      )}
      <p className="muted">Usa el RPC <code>ensure_user</code> del backend.</p>
    </div>
  );
}
