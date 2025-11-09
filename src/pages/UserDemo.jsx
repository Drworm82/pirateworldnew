// src/pages/UserDemo.jsx
import React, { useState } from "react";
import { ensureUser, getUserState, creditAd } from "../lib/supaApi.js";

const DEFAULT_EMAIL = "worm_jim@hotmail.com";

export default function UserDemo() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Listo.");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setBusy(true);
      const { user: u } = await ensureUser(email.trim());
      const fresh = await getUserState({ email: email.trim() });
      setUser({ id: fresh?.user_id ?? u.id, email: email.trim(), soft_coins: fresh?.soft_coins ?? 0 });
      setStatus("Usuario listo.");
    } catch (e) {
      setStatus("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function watchAd() {
    if (!user?.id) return alert("Primero crea/carga el usuario.");
    try {
      setBusy(true);
      setStatus("Acreditando anuncio…");
      const res = await creditAd(user.id, "ad_view");
      setUser((u) => ({ ...u, soft_coins: res.balance }));
      setStatus("Anuncio acreditado (+1).");
    } catch (e) {
      alert("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    if (!user?.id) return;
    const fresh = await getUserState({ userId: user.id });
    setUser((u) => ({ ...u, soft_coins: fresh.soft_coins }));
  }

  return (
    <>
      <section className="card">
        <h3>Email de prueba</h3>
        <div className="row">
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
          <button className="btn" onClick={load} disabled={busy}>Crear / Cargar</button>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h3>Usuario</h3>
          <pre className="pre">
{JSON.stringify(user ?? {info:'(sin usuario)'}, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h3>Saldo</h3>
          <div className="big">{user?.soft_coins ?? 0}</div>
          <p className="muted">1 anuncio = 1 doblón · 100 doblones = 1 parcela</p>
          <div className="row">
            <button className="btn" onClick={watchAd} disabled={busy || !user}>Ver anuncio (+1)</button>
            <button className="btn ghost" onClick={refresh} disabled={!user}>Refrescar saldo</button>
          </div>
        </div>
      </section>

      <p className="muted">{status}</p>

      <div className="row" style={{marginTop:12}}>
        <a className="btn ghost" href="#/tiles">→ Ir a Demo parcelas (tiles)</a>
      </div>
    </>
  );
}
