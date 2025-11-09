// src/pages/TilesDemo.jsx
import React, { useEffect, useState } from "react";
import { ensureUser, getUserState, tilesNear, buyTileById } from "../lib/supaApi.js";

const DEFAULT_EMAIL = "worm_jim@hotmail.com";

async function getPosition() {
  return new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => res({
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
  const [lat, setLat]   = useState(19.4276);
  const [lng, setLng]   = useState(-99.1382);
  const [radius, setRadius] = useState(300);
  const [tiles, setTiles] = useState([]);
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
          soft_coins: fresh?.soft_coins ?? 0
        });
      } catch {
        setStatus("Error al cargar usuario.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUseGPS() {
    try {
      setBusy(true);
      const p = await getPosition();
      setLat(p.lat); setLng(p.lng);
    } catch (e) {
      alert("No se pudo leer GPS: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    try {
      setBusy(true);
      setStatus("Buscando tiles…");
      const { list } = await tilesNear(lat, lng, radius);
      setTiles(list ?? []);
      setStatus(`Tiles: ${list?.length ?? 0} encontrados.`);
    } catch (e) {
      setStatus("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handleBuy(t) {
    if (!user?.id) return alert("Carga el usuario primero.");
    try {
      setBusy(true);
      setStatus("Comprando…");
      const res = await buyTileById(user.id, t.id, lat, lng, radius);
      if (res?.ok) {
        alert("✅ Parcela comprada");
        await handleSearch(); // refresca
        const fresh = await getUserState({ userId: user.id });
        if (fresh) setUser((u)=>({ ...u, soft_coins: fresh.soft_coins }));
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
    <>
      <p className="muted">{status}</p>

      <section className="card">
        <h3>Usuario</h3>
        <div className="row">
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn" onClick={async()=>{
            const { user: u } = await ensureUser(email.trim());
            const fresh = await getUserState({ email: email.trim() });
            setUser({ id: fresh?.user_id ?? u.id, email: email.trim(), soft_coins: fresh?.soft_coins ?? 0 });
          }}>Crear / Cargar</button>
        </div>
        <pre className="pre" style={{marginTop:8}}>
{JSON.stringify(user ?? {info:'(sin usuario)'}, null, 2)}
        </pre>
      </section>

      <section className="card">
        <h3>Ubicación</h3>
        <div className="row wrap">
          <button className="btn" onClick={handleUseGPS} disabled={busy}>Usar GPS</button>
          <input className="input" type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value)||0)} step="0.0001"/>
          <input className="input" type="number" value={lng} onChange={e=>setLng(parseFloat(e.target.value)||0)} step="0.0001"/>
          <input className="input" type="number" value={radius} onChange={e=>setRadius(parseInt(e.target.value)||300)} />
          <button className="btn ghost" onClick={handleSearch} disabled={busy}>Buscar tiles</button>
        </div>
      </section>

      <section className="card">
        <h3>Resultados ({tiles.length})</h3>
        <ol className="list">
          {tiles.length === 0 && <li className="muted">(sin resultados)</li>}
          {tiles.map(t => {
            const free = !t.owner_id;
            const dist = (t.distance_m ?? 0).toFixed(1);
            const x = (t.x ?? 0).toFixed(5);
            const y = (t.y ?? 0).toFixed(5);
            return (
              <li key={t.id} className="tile-row">
                <span className="mono">{t.id}</span>
                <span className="pill">{x}, {y}</span>
                <span className="pill">{dist} m</span>
                <span className={`badge ${free ? "ok":"bad"}`}>{free ? "libre":"ocupado"}</span>
                {free && (
                  <button className="btn xs" onClick={()=>handleBuy(t)} disabled={busy || !user}>
                    Comprar
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
