// src/pages/SetupSupabase.jsx
import React, { useEffect, useState } from "react";
import supabase from "../lib/supaClient.js";

export default function SetupSupabase() {
  const [status, setStatus] = useState({ ok: false, msg: "Comprobando…" });
  const [project, setProject] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anon: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  });

  useEffect(() => {
    (async () => {
      try {
        // Probar la conexión leyendo cualquier fila
        const { error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;
        setStatus({ ok: true, msg: "Conectado a Supabase ✅" });
      } catch (e) {
        setStatus({ ok: false, msg: "Error de conexión: " + (e?.message || e) });
      }
    })();
  }, []);

  return (
    <>
      <section className="card">
        <h3>Estado</h3>
        <p className={status.ok ? "ok" : "error"}>{status.msg}</p>
        <div className="grid two">
          <div>
            <label className="label">VITE_SUPABASE_URL</label>
            <input className="input" value={project.url} readOnly />
          </div>
          <div>
            <label className="label">VITE_SUPABASE_ANON_KEY</label>
            <input className="input" value={project.anon.slice(0, 16) + (project.anon ? "…" : "")} readOnly />
          </div>
        </div>
        <p className="muted" style={{marginTop:8}}>
          Si necesitas cambiar estas variables, edita <code>.env.local</code> y reinicia Vite.
        </p>
      </section>

      <section className="card">
        <h3>Atajos</h3>
        <div className="row">
          <a className="btn ghost" href="#/user">→ Demo usuario</a>
          <a className="btn ghost" href="#/tiles">→ Demo parcelas</a>
        </div>
      </section>
    </>
  );
}
