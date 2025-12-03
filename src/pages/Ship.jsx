// ===================================================================
// Ship.jsx — Vista del barco en tiempo real (V5 PRO ULTRA)
// Con eventos, sonidos, costos y HUD profesional
// ===================================================================

import React, { useEffect, useState } from "react";
import {
  ensureUser,
  getShipProgress,
  autoNav,
} from "../lib/supaApi.js";

import { playEventSound } from "../lib/SoundPlayer.js";

import SeaEventsBox from "../components/SeaEventsBox.jsx";
import SeaEventLog from "../components/SeaEventLog.jsx";

export default function Ship() {
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [events, setEvents] = useState([]); // historial corto + animación
  const [log, setLog] = useState([]); // historial completo
  const [loading, setLoading] = useState(true);

  // ======================================================
  // INIT + POLLING
  // ======================================================
  useEffect(() => {
    async function init() {
      const u = await ensureUser();
      setUserId(u.id);

      const p = await getShipProgress(u.id);
      setProgress(p);
      setLoading(false);

      // Polling 1.5s
      const interval = setInterval(async () => {
        const p2 = await getShipProgress(u.id);
        setProgress(p2);
      }, 1500);

      return () => clearInterval(interval);
    }

    init();
  }, []);

  // ======================================================
  // Expiración AUTOMÁTICA de los eventos del HUD (30 s)
  // ======================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) =>
        prev.map((e) =>
          Date.now() - e.timestamp > 30000
            ? { ...e, expired: true }
            : e
        )
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // ======================================================
  // AUTONAV — Genera evento (tormenta, piratas, loot, etc.)
  // ======================================================
  async function handleAutoNav() {
    if (!userId) return;

    const res = await autoNav(userId);
    console.log("AutoNav:", res);

    if (res?.event) {
      const ev = {
        id: Date.now(),
        title: res.event.title || "Evento",
        description: res.event.description || "",
        type: res.event.type || "default",
        cost: res.event.cost || 0,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString(),
      };

      // HUD (5 últimos)
      setEvents((prev) => [...prev.slice(-4), ev]);

      // LOG completo
      setLog((prev) => [...prev, ev]);

      // 🔊 reproducir sonido
      playEventSound(ev.type);
    }

    const updated = await getShipProgress(userId);
    setProgress(updated);
  }

  // ======================================================
  // LOADING
  // ======================================================
  if (loading || !progress) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        <h2>Cargando barco...</h2>
      </div>
    );
  }

  // ======================================================
  // UI PRINCIPAL
  // ======================================================
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>🚢 Tu Barco</h1>

      {/* === PANEL DE ESTADO === */}
      <div
        style={{
          padding: 15,
          background: "rgba(0,0,0,0.55)",
          border: "1px solid #4da3ff",
          borderRadius: 12,
          maxWidth: 420,
        }}
      >
        <h3>Estado del Viaje</h3>

        <p>
          <strong>
            {progress.status === "traveling" ? "En viaje" : "En puerto"}
          </strong>
        </p>

        <p><strong>Origen:</strong> {progress.origin}</p>
        <p><strong>Destino:</strong> {progress.destination || "—"}</p>
        <p><strong>Distancia total:</strong> {progress.distance_km} km</p>

        {/* Progreso */}
        <p><strong>Avance:</strong> {progress.percent?.toFixed(1)}%</p>

        <div
          style={{
            marginTop: 8,
            height: 10,
            width: "100%",
            background: "#222",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress.percent}%`,
              background: "#4da3ff",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Posición actual */}
        <div style={{ marginTop: 12 }}>
          <p><strong>Lat:</strong> {Number(progress.current_lat).toFixed(5)}</p>
          <p><strong>Lng:</strong> {Number(progress.current_lng).toFixed(5)}</p>
        </div>

        {/* Botón AUTO NAV */}
        {progress.status === "traveling" && (
          <button
            onClick={handleAutoNav}
            style={{
              marginTop: 15,
              padding: "10px 15px",
              background: "#4da3ff",
              border: "none",
              borderRadius: 8,
              width: "100%",
              cursor: "pointer",
            }}
          >
            Forzar evento ⚡
          </button>
        )}
      </div>

      {/* === HUD flotante: últimos eventos === */}
      <SeaEventsBox events={events} />

      {/* === LOG completo === */}
      <SeaEventLog events={log} />
    </div>
  );
}
