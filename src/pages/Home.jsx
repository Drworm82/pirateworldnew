// ================================================
// Home.jsx — Versión PRO v4 (Diciembre 2025)
// Inicializa automáticamente el barco si no existe
// ================================================

import React, { useEffect, useState } from "react";
import { ensureUser, initShip, debugState } from "../lib/supaApi.js";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [shipReady, setShipReady] = useState(false);

  useEffect(() => {
    async function init() {
      // 1) Asegurar usuario anónimo
      const u = await ensureUser();
      setUserId(u.id);

      // 2) Verificar si ya existe ship_state
      const state = await debugState(u.id);

      // 3) Si no existe, inicializar barco
      if (!state) {
        console.log("Home.jsx → No existe ship_state, creando barco…");
        await initShip(u.id);
      }

      // 4) Todo listo
      setShipReady(true);
      setLoading(false);
    }

    init();
  }, []);

  // Pantalla mientras se inicializa
  if (loading) {
    return (
      <div
        style={{
          color: "white",
          fontFamily: "sans-serif",
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2>Inicializando tu barco...</h2>
        <p>Espera un momento capitán.</p>
      </div>
    );
  }

  // Pantalla principal
  return (
    <div
      style={{
        color: "white",
        padding: 20,
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1>🏴‍☠️ PirateWorld</h1>
      <p>Bienvenido capitán.</p>

      {shipReady && (
        <p style={{ opacity: 0.7 }}>Tu barco está listo para zarpar.</p>
      )}
    </div>
  );
}
