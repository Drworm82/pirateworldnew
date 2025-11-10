// src/pages/TilesDemo.jsx
import { useEffect, useState } from "react";
import { ensureUser, getUserState, cellsNear, buyCell, tilesNear } from "../lib/supaApi.js";

const card = (extra = {}) => ({
  background: "#0e1624",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #1f2937",
  ...extra,
});
const row = (extra = {}) => ({ display: "flex", gap: 8, alignItems: "center", ...extra });
const muted = { color: "#9aa6b2" };
const DEFAULT_EMAIL = "worm_jim@hotmail.com";
const PRICE = 100; // costo por celda

async function getPosition() {
  return new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        res({
          lat: +pos.coords.latitude.toFixed(6),
          lng: +pos.coords.longitude.toFixed(6),
        }),
      (err) => rej(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export default function TilesDemo() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [user, setUser] = useState(null);
  const [lat, setLat] = useState(19.4276);
  const [lng, setLng] = useState(-99.1382);
  const [radius, setRadius] = useState(300);
  const [limit, setLimit] = useState(120);
  const [cells, setCells] = useState([]);
  const [status, setStatus] = useState("Listo.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user: u } = await ensureUser(email);
        const fresh = await getUserState({ email });
        setUser({
          id: fresh?.user_id ?? u.id,
          email: fresh?.email ?? email,
          soft_coins: fresh?.soft_coins ?? 0,
        });
      } catch (e) {
        console.error(e);
        setStatus("Error al cargar usuario.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshBalance(uid) {
    const fresh = await getUserState({ userId: uid });
    if (fresh) setUser((u) => ({ ...u, soft_coins: fresh.soft_coins }));
  }

  async function handleUseGPS() {
    try {
      setBusy(true);
      const p = await getPosition();
      setLat(p.lat);
      setLng(p.lng);
    } catch (e) {
      alert("No se pudo leer GPS: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    try {
      setBusy(true);
      setStatus("Buscando celdas…");
      // Intento principal: cells_near
      let list;
      try {
        const r = await cellsNear(lat, lng, radius, limit);
        list = r.list ?? [];
      } catch (err) {
        // Fallback si la función no existe aún en el backend
        if (err?.code === "PGRST202" || /cells_near/i.test(err?.message || "")) {
          const r2 = await tilesNear(lat, lng, radius);
          // Normaliza a forma de "cells" para no cambiar el render
          list = (r2.list ?? []).map((t) => ({
            cell_qx: t.qx ?? 0,
            cell_qy: t.qy ?? 0,
            x: t.x,
            y: t.y,
            tile_id: t.id,
            owner_id: t.owner_id,
            distance_m: t.distance_m,
          }));
          setStatus("Usando tiles_near (fallback).");
        } else {
          throw err;
        }
      }

      setCells(list);
      setStatus(`Celdas: ${list.length} encontradas.`);
    } catch (e) {
      console.error(e);
      setStatus("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handleBuy(c) {
    if (!user?.id) return alert("Carga el usuario primero.");
    try {
      setBusy(true);
      setStatus("Comprando…");
      const res = await buyCell(user.id, c.cell_qx, c.cell_qy);
      if (res?.ok) {
        alert("✅ Parcela comprada");
        await handleSearch(); // refresca (debe pasar a ocupado)
        await refreshBalance(user.id);
      } else {
        alert("⚠️ " + (res?.error || "No se pudo comprar"));
      }
    } catch (e) {
      alert("⚠️ " + (e?.message || e));
    } finally {
      setBusy(false);
      setStatus("Listo.");
    }
  }

  return (
    <div style={{ padding: 16, color: "#e6edf3" }}>
      <h1>Demo parcelas (cells)</h1>
      <p style={muted}>{status}</p>

      <div style={card({ marginTop: 12 })}>
        <h3 style={{ margin: "4px 0" }}>Usuario</h3>
        <div style={row()}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1 }} />
          <button
            onClick={async () => {
              const { user: u } = await ensureUser(email.trim());
              const fresh = await getUserState({ email: email.trim() });
              setUser({
                id: fresh?.user_id ?? u.id,
                email: email.trim(),
                soft_coins: fresh?.soft_coins ?? 0,
              });
            }}
          >
            Crear / Cargar
          </button>
        </div>
        <pre
          style={{
            fontSize: 12,
            background: "#0a0f18",
            padding: 8,
            borderRadius: 8,
            marginTop: 8,
          }}
        >
{JSON.stringify(user ?? { info: "(sin usuario)" }, null, 2)}
        </pre>
      </div>

      <div style={card({ marginTop: 12 })}>
        <h3 style={{ margin: "4px 0" }}>Ubicación</h3>
        <div style={row({ marginTop: 8 })}>
          <button onClick={handleUseGPS} disabled={busy}>
            Usar GPS
          </button>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
            step="0.0001"
            title="latitud"
          />
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
            step="0.0001"
            title="longitud"
          />
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 300)}
            title="radio (m)"
          />
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 120)}
            title="límite resultados"
          />
          <button onClick={handleSearch} disabled={busy}>
            Buscar celdas
          </button>
        </div>
        <p className="muted" style={{ marginTop: 6 }}>
          Precio por celda: <b>{PRICE}</b> doblones · Saldo: <b>{user?.soft_coins ?? 0}</b>
        </p>
      </div>

      <div style={card({ marginTop: 12 })}>
        <h3 style={{ margin: "4px 0" }}>Resultados ({cells.length})</h3>
        <ol style={{ fontFamily: "ui-monospace,monospace", fontSize: 13 }}>
          {cells.length === 0 && <li>(sin resultados)</li>}
          {cells.map((c) => {
            const free = !c.owner_id;
            return (
              <li key={`${c.cell_qx}:${c.cell_qy}`} style={{ margin: "6px 0" }}>
                ({(c.x ?? 0).toFixed(5)}, {(c.y ?? 0).toFixed(5)}) · q=({c.cell_qx}, {c.cell_qy}) ·
                dist: {(c.distance_m ?? 0).toFixed(1)} m ·
                {free ? " 🟩 libre" : " 🟥 ocupado"}
                {free && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => handleBuy(c)}
                    disabled={busy || !user}
                  >
                    Comprar
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
