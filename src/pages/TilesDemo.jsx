// src/pages/TilesDemo.jsx
import React, { useEffect, useMemo, useState } from "react";
import { cellsNear, buyParcel } from "../lib/supaApi.js";
import PurchaseOverlay from "../components/PurchaseOverlay.jsx";

// === Malla consistente con el backend ===
// 4 decimales ≈ 0.0001° ≈ 10–11 m en latitud
const PREC = 4;
const STEP_DEG = 0.0001; // tamaño de celda en grados
const COLS = 16;
const ROWS = 10;

function roundCoord(n, d = PREC) {
  // Evita problemas de coma flotante
  return Number((Math.round(Number(n + "e+" + d)) + "e-" + d));
}

// Ancla el centro a la malla (para que el grid siempre “caiga” en la rejilla)
function snapCenter(center) {
  return {
    lat: roundCoord(center.lat, PREC),
    lng: roundCoord(center.lng, PREC),
  };
}

export default function TilesDemo() {
  const [center, setCenter] = useState(snapCenter({ lat: 19.4326, lng: -99.1332 })); // CDMX
  const [tilesDB, setTilesDB] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Listo.");
  const [userId, setUserId] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Cargar user ID de “Demo usuario”
  useEffect(() => {
    const uid = localStorage.getItem("last_user_id");
    if (uid) setUserId(uid);
  }, []);

  // Carga desde RPC (lo que ya existe cerca del centro)
  async function loadFromDB() {
    try {
      setBusy(true);
      setStatus("Cargando parcelas cercanas…");
      const data = await cellsNear(center.lat, center.lng, 2000, 200);
      // Redondea lo que viene de DB por si hubiera valores previos sin normalizar
      const norm = (data || []).map((t) => ({
        ...t,
        x: t?.x != null ? roundCoord(t.x) : t.x,
        y: t?.y != null ? roundCoord(t.y) : t.y,
      }));
      setTilesDB(norm);
      setStatus(`Parcelas encontradas: ${norm.length}`);
    } catch (e) {
      console.error(e);
      setTilesDB([]);
      setStatus("Error al cargar parcelas: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadFromDB();
  }, [center.lat, center.lng]);

  // Grid embebido (vista normal) alineado a la malla
  const gridSmall = useMemo(() => {
    const db = tilesDB || [];

    // Arriba/izquierda del grid alineado y redondeado
    const lat0 = roundCoord(center.lat + (ROWS / 2 - 0.5) * STEP_DEG);
    const lng0 = roundCoord(center.lng - (COLS / 2 - 0.5) * STEP_DEG);

    // index simple por "x|y" para lookup exacto
    const index = new Map();
    for (const t of db) {
      if (t.x != null && t.y != null) {
        index.set(`${roundCoord(t.x)}|${roundCoord(t.y)}`, t);
      }
    }

    const out = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const lat = roundCoord(lat0 - r * STEP_DEG);
        const lng = roundCoord(lng0 + c * STEP_DEG);
        const key = `${lng}|${lat}`; // ojo: x=lng | y=lat
        const match = index.get(key);
        const owner = match?.owner_id || null;
        out.push({
          key: `${r}-${c}`,
          lat,
          lng,
          owner,
          mine: owner && userId && owner === userId,
        });
      }
    }
    return out;
  }, [tilesDB, center, userId]);

  function colorOf(cell) {
    if (!cell.owner) return "#22c55e"; // libre
    if (cell.mine) return "#3b82f6";   // tuya
    return "#4b5563";                  // ocupada
  }

  async function buyAt(lat, lng) {
    if (!userId) {
      alert("Primero crea/carga tu usuario en «Demo usuario».");
      return;
    }
    // Redondear en cliente ANTES de comprar (match perfecto con backend)
    const rx = roundCoord(lng);
    const ry = roundCoord(lat);
    const ok = confirm(`¿Comprar por 100 doblones?\n(${ry.toFixed(PREC)}, ${rx.toFixed(PREC)})`);
    if (!ok) return;
    try {
      setBusy(true);
      setStatus("Comprando parcela…");
      const res = await buyParcel(userId, rx, ry, 100);
      alert(JSON.stringify(res, null, 2));
      await loadFromDB();
      setStatus("Compra completada ✅");
    } catch (e) {
      console.error(e);
      alert("Error al comprar: " + e.message);
      setStatus("Error al comprar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h3>Mapa de parcelas</h3>
      <p className="muted">
        <span style={{ color: "#22c55e" }}>■</span> Libres ·{" "}
        <span style={{ color: "#3b82f6" }}>■</span> Tuyas ·{" "}
        <span style={{ color: "#4b5563" }}>■</span> Ocupadas
      </p>

      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <button className="btn" onClick={loadFromDB} disabled={busy}>🔄 Recargar</button>
        <button className="btn" onClick={() => setShowOverlay(true)} disabled={busy}>🗺️ Modo compra</button>
        <button
          className="btn ghost"
          onClick={() => setCenter(snapCenter({ lat: 19.4326, lng: -99.1332 }))}
          disabled={busy}
        >
          📍 Centrar CDMX
        </button>
      </div>

      {/* grid compacto */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 24px)`,
          gap: "4px",
          background: "#000",
          padding: 8,
          borderRadius: 8,
          width: "min-content",
        }}
      >
        {gridSmall.map((cell) => (
          <div
            key={cell.key}
            title={`(${cell.lat.toFixed(PREC)}, ${cell.lng.toFixed(PREC)})`}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: colorOf(cell),
              boxShadow: "0 0 4px rgba(0,0,0,.4)",
            }}
          />
        ))}
      </div>

      <pre className="pre" style={{ marginTop: 12, maxHeight: 220, overflow: "auto" }}>
        {JSON.stringify(tilesDB, null, 2)}
      </pre>
      <p className="muted">{status}</p>

      {showOverlay && (
        <PurchaseOverlay
          center={center}
          tilesDB={tilesDB}
          userId={userId}
          onBuy={(lat, lng) => buyAt(lat, lng)}  // compra con redondeo en cliente
          onClose={() => setShowOverlay(false)}
        />
      )}
    </section>
  );
}
