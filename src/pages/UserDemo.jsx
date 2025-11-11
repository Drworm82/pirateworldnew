// src/pages/UserDemo.jsx
import React, { useState } from "react";
import { ensureUser, getUserState, creditAd } from "../lib/supaApi.js";
import { supabase } from "../lib/supaClient.js";

const DEFAULT_EMAIL = "worm_jim@hotmail.com";

export default function UserDemo() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Listo.");
  const [busy, setBusy] = useState(false);

  // --- Crear o cargar usuario ---
  async function load() {
    try {
      setBusy(true);
      const { user: u } = await ensureUser(email.trim());
      const fresh = await getUserState({ email: email.trim() });
      const newUser = {
        id: fresh?.user_id ?? u.id,
        email: email.trim(),
        soft_coins: fresh?.soft_coins ?? 0,
      };
      setUser(newUser);
      localStorage.setItem("last_user_id", newUser.id); // 🔵 guarda tu UUID
      setStatus("Usuario listo.");
    } catch (e) {
      setStatus("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  // --- Ver anuncio ---
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

  // --- Refrescar saldo ---
  async function refresh() {
    if (!user?.id) return;
    const fresh = await getUserState({ userId: user.id });
    setUser((u) => ({ ...u, soft_coins: fresh.soft_coins }));
  }

  // --- Probar compra manual (x=10, y=20) ---
  async function buyParcelTest() {
    if (!user?.id) return alert("Primero crea/carga el usuario.");
    try {
      setBusy(true);
      setStatus("Comprando parcela de prueba…");
      const { data, error } = await supabase.rpc("buy_parcel", {
        p_user_id: user.id,
        p_cost: 100,
        p_x: 10,
        p_y: 20,
      });
      if (error) throw error;
      alert(JSON.stringify(data, null, 2));
      await refresh();
      setStatus("Compra de parcela completada.");
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
      setStatus("Error al comprar parcela.");
    } finally {
      setBusy(false);
    }
  }

  // --- Comprar parcela en ubicación real (GPS) ---
  async function buyParcelHere() {
    if (!user?.id) return alert("Primero crea/carga el usuario.");
    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta GPS.");
      return;
    }

    setBusy(true);
    setStatus("Obteniendo ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setStatus(
            `Comprando parcela en (${latitude.toFixed(4)}, ${longitude.toFixed(
              4
            )})...`
          );

          const { data, error } = await supabase.rpc("buy_parcel", {
            p_user_id: user.id,
            p_cost: 100,
            p_x: longitude,
            p_y: latitude,
          });

          if (error) throw error;
          alert(JSON.stringify(data, null, 2));
          await refresh();
          setStatus("Compra completada ✅");
        } catch (e) {
          console.error(e);
          alert("Error en la compra: " + e.message);
          setStatus("Error al comprar.");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        alert("Error de GPS: " + err.message);
        setBusy(false);
        setStatus("Error de geolocalización.");
      },
      { enableHighAccuracy: true }
    );
  }

  // --- Render ---
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
          <button className="btn" onClick={load} disabled={busy}>
            Crear / Cargar
          </button>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <h3>Usuario</h3>
          <pre className="pre">
            {JSON.stringify(user ?? { info: "(sin usuario)" }, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h3>Saldo</h3>
          <div className="big">{user?.soft_coins ?? 0}</div>
          <p className="muted">
            1 anuncio = 1 doblón · 100 doblones = 1 parcela
          </p>
          <div className="row">
            <button className="btn" onClick={watchAd} disabled={busy || !user}>
              Ver anuncio (+1)
            </button>
            <button className="btn ghost" onClick={refresh} disabled={!user}>
              Refrescar saldo
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Prueba de compra</h3>
        <p>
          Usa el RPC <code>buy_parcel(p_user_id, p_cost, p_x, p_y)</code>
        </p>
        <button className="btn" onClick={buyParcelTest} disabled={busy || !user}>
          🏝️ Probar buy_parcel
        </button>
      </section>

      <section className="card">
        <h3>Compra de parcela (GPS)</h3>
        <p className="muted">
          Compra una parcela en tu ubicación actual usando el GPS del dispositivo.
        </p>
        <button className="btn" onClick={buyParcelHere} disabled={busy || !user}>
          🗺️ Comprar parcela aquí
        </button>
      </section>

      <p className="muted">{status}</p>

      <div className="row" style={{ marginTop: 12 }}>
        <a className="btn ghost" href="#/tiles">
          → Ir a Demo parcelas (tiles)
        </a>
      </div>
    </>
  );
}
