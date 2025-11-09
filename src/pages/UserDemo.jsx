// src/pages/UserDemo.jsx
import { useState } from "react";
import { isConfigured, getClient } from "../lib/supaApi";

export default function UserDemo() {
  const [email, setEmail] = useState("worm_jim@hotmail.com");
  const [msg, setMsg] = useState("");
  const ok = isConfigured();

  async function createOrLoad() {
    setMsg("");
    try {
      const sb = getClient();

      // Llama al RPC directamente. Ajusta el nombre del arg si tu función usa otro (p.ej. p_email).
      const { data, error } = await sb.rpc("ensure_user", { p_email: email });
      if (error) throw error;

      // data esperado: { id, email, soft_coins }
      setMsg(
        `OK -> id=${data?.id ?? "?"} · email=${data?.email ?? "?"} · soft_coins=${data?.soft_coins ?? "?"}`
      );
    } catch (e) {
      setMsg("Error: " + (e?.message || String(e)));
    }
  }

  return (
    <section>
      <h1>Demo de Usuario</h1>
      <p>
        Supabase: <b>{ok ? "Configurado" : "Sin configurar"}</b>
      </p>

      <label>Email:</label>{" "}
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <div style={{ marginTop: 8 }}>
        <button onClick={createOrLoad}>Crear/Cargar usuario</button>
      </div>

      <pre style={{ marginTop: 12 }}>{msg}</pre>
    </section>
  );
}
