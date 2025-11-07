// src/pages/UserDemo.jsx
import { useState } from "react";
import api from "../lib/supaApi"; // <- usar default import

export default function UserDemo() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const configured = api.isConfigured?.();

  async function handleEnsure() {
    try {
      setLoading(true);
      setOut("Creando/cargando usuario...");
      const { user } = await api.ensureUser(email);
      setOut(
        `OK -> id=${user.id} · email=${user.email} · soft_coins=${user.soft_coins}`
      );
    } catch (e) {
      setOut("Error: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  function quickSetEnv() {
    const url = prompt("VITE_SUPABASE_URL:");
    const key = prompt("VITE_SUPABASE_ANON_KEY:");
    if (url && key) {
      api.saveRuntimeEnv?.(url, key);
      alert("Guardado. Recarga la página y vuelve a intentar.");
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>Demo de Usuario</h2>
      <p style={{ color: configured ? "green" : "crimson" }}>
        Supabase: {configured ? "Configurado" : "NO configurado"}
      </p>

      {!configured && (
        <button onClick={quickSetEnv} style={btn}>
          Configurar Supabase (runtime)
        </button>
      )}

      <div style={{ marginTop: 12 }}>
        <label>
          Email:&nbsp;
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>
      </div>

      <button
        onClick={handleEnsure}
        style={{ ...btn, marginTop: 12 }}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Crear/Cargar usuario"}
      </button>

      <pre style={pre}>{out}</pre>
    </main>
  );
}

const btn = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #0b132b",
  background: "#0b132b",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const input = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #bbb",
  minWidth: 280,
};

const pre = {
  background: "#f5f5f5",
  border: "1px solid #eee",
  borderRadius: 8,
  padding: 12,
  marginTop: 12,
  whiteSpace: "pre-wrap",
};
