// ============================
// Explore.jsx — PirateWorld (V3 FINAL CORREGIDO)
// ============================

import React, { useEffect, useState } from "react";
import {
  ensureUser,
  startShipTravelV3,
  getShipProgress,
} from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

// ============================
// MAPA
// ============================
const WORLD = {
  minLat: 19.30,
  maxLat: 19.60,
  minLng: -99.30,
  maxLng: -99.00,
  mapSize: 2048,
};

// ============================
// POSICIONES REALES
// ============================
const ISLAND_COORDS = {
  bahia_ajolote: { lat: 19.420407, lng: -99.138805 },
  campanas_blancas: { lat: 19.4301, lng: -99.1402 },
  cala_rey_errante: { lat: 19.412, lng: -99.15 },
  refugio_hermandad: { lat: 19.4185, lng: -99.133 },
  gaviotas_negras: { lat: 19.425, lng: -99.1455 },
  mercado_koyo: { lat: 19.4153, lng: -99.1289 },
};

const RAW_ISLANDS = [
  { key: "bahia_ajolote", name: "Bahía del Ajolote" },
  { key: "campanas_blancas", name: "Isla de las Campanas Blancas" },
  { key: "cala_rey_errante", name: "Cala del Rey Errante" },
  { key: "refugio_hermandad", name: "Refugio de la Hermandad" },
  { key: "gaviotas_negras", name: "Bahía de las Gaviotas Negras" },
  { key: "mercado_koyo", name: "Mercado Coral de Köyō" },
];

// ============================
// Conversión lat/lng → pixeles
// ============================
function latLngToPixel(lat, lng) {
  const { minLat, maxLat, minLng, maxLng, mapSize } = WORLD;

  const x = ((lng - minLng) / (maxLng - minLng)) * mapSize;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * mapSize;

  return { x, y };
}

// ============================
// Calcular rumbo
// ============================
function computeHeading(lat1, lng1, lat2, lng2) {
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ============================
// Mini Mapa
// ============================
function MiniMap({ x, y, heading }) {
  const size = WORLD.mapSize;

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 2000 }}>
      <div style={{ position: "relative", width: 220, height: 220 }}>
        <img
          src="/ui/minimap-frame.svg"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            top: 20,
            left: 20,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <img
            src="/maps/world-base-2048.png"
            style={{
              position: "absolute",
              width: size,
              height: size,
              left: -x + 90,
              top: -y + 90,
              filter: "sepia(0.4) brightness(0.9)",
            }}
          />
        </div>

        <img
          src="/icons/ship-vintage.svg"
          style={{
            position: "absolute",
            top: 85,
            left: 85,
            width: 50,
            height: 50,
            zIndex: 6,
            transform: `rotate(${heading}deg)`,
            transition: "transform 0.15s linear",
          }}
        />
      </div>
    </div>
  );
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [serverState, setServerState] = useState(null);

  const [interp, setInterp] = useState({
    lat: 19.420407,
    lng: -99.138805,
    heading: 0,
  });

  // ============================
  // Cargar usuario
  // ============================
  useEffect(() => {
    (async () => {
      const { user } = await ensureUser("worm_jim@hotmail.com");
      setUser(user);
      await refreshServerState(user.id);
      setLoading(false);
    })();
  }, []);

  // ============================
  // Polling 1s
  // ============================
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => refreshServerState(user.id), 1000);
    return () => clearInterval(t);
  }, [user]);

  // ============================
  // Animación 60 FPS
  // ============================
  useEffect(() => {
    let anim;
    function loop() {
      anim = requestAnimationFrame(loop);
      if (!serverState) return;

      const lerp = (a, b, t) => a + (b - a) * t;

      setInterp((prev) => ({
        lat: lerp(prev.lat, serverState.lat, 0.10),
        lng: lerp(prev.lng, serverState.lng, 0.10),
        heading: lerp(prev.heading, serverState.heading, 0.12),
      }));
    }
    loop();
    return () => cancelAnimationFrame(anim);
  }, [serverState]);

  // ============================
  // Obtener estado del barco
  // ============================
  async function refreshServerState(userId) {
    const raw = await getShipProgress(userId);
    if (!raw?.ok) return;

    const lat = raw.lat ?? raw.current_lat ?? raw.shipLat;
    const lng = raw.lng ?? raw.current_lng ?? raw.shipLng;

    let heading = interp.heading;

    if (raw.status === "traveling") {
      heading = computeHeading(lat, lng, raw.destination_lat, raw.destination_lng);
    }

    setServerState({
      status: raw.status,
      lat,
      lng,
      distance: raw.status === "idle" ? 0 : raw.distance_km,
      percent: raw.percent,
      speed: raw.speed_kmh,
      heading,
      origin: raw.origin,
      destination: raw.destination,
      origin_lat: raw.origin_lat,
      origin_lng: raw.origin_lng,
      destination_lat: raw.destination_lat,
      destination_lng: raw.destination_lng,
      departure_time: raw.departure_time,
      arrival_time: raw.arrival_time,
    });
  }

  // ============================
  // Iniciar viaje
  // ============================
  async function startTravel(dest) {
    if (!user) return;

    const originKey =
      serverState?.origin || "bahia_ajolote"; // ← CORREGIDO

    const from = ISLAND_COORDS[originKey];
    const to = ISLAND_COORDS[dest];

    await startShipTravelV3(
      user.id,
      originKey,
      dest,
      from.lat,
      from.lng,
      to.lat,
      to.lng
    );

    toast.success("Zarpando...");
    refreshServerState(user.id);
  }

  // ============================
  // Render
  // ============================
  if (loading) return <p>Cargando...</p>;

  const pixelPos = latLngToPixel(interp.lat, interp.lng);

  return (
    <div className="page-container">
      <h1 className="big">Explorar</h1>

      <MiniMap x={pixelPos.x} y={pixelPos.y} heading={interp.heading} />

      <section className="card ledger-card">
        {!serverState ? (
          <p>Cargando...</p>
        ) : (
          <>
            <p><strong>Estado:</strong> {serverState.status}</p>
            <p><strong>Origen:</strong> {serverState.origin}</p>
            <p><strong>Destino:</strong> {serverState.destination}</p>
            <p><strong>GPS:</strong> {interp.lat.toFixed(6)}, {interp.lng.toFixed(6)}</p>
            <p><strong>Distancia:</strong> {serverState.distance?.toFixed(2)} km</p>
            <p><strong>Velocidad:</strong> {serverState.speed?.toFixed(2)} km/h</p>
          </>
        )}
      </section>

      <section className="card ledger-card">
        <h2>Islas</h2>

        {RAW_ISLANDS.map((island) => {
          const isOrigin = serverState?.origin === island.key;
          const isDestination = serverState?.destination === island.key;
          const isTraveling = serverState?.status === "traveling";

          // Caso 1 — Idle: desactivar isla actual
          if (!isTraveling && isOrigin) {
            return (
              <button
                key={island.key}
                className="btn btn-disabled"
                style={{
                  margin: 6,
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
                disabled
              >
                Ya estás aquí → {island.name}
              </button>
            );
          }

          // Caso 2 — Traveling: bloquear origen y destino
          if (isTraveling && (isOrigin || isDestination)) {
            return (
              <button
                key={island.key}
                className="btn btn-disabled"
                style={{
                  margin: 6,
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
                disabled
              >
                {isOrigin ? "Zarpaste desde →" : "Destino en curso →"} {island.name}
              </button>
            );
          }

          // Caso 3 — Botones normales
          return (
            <button
              key={island.key}
              className="btn btn-primary"
              style={{ margin: 6 }}
              onClick={() => startTravel(island.key)}
            >
              Zarpar → {island.name}
            </button>
          );
        })}
      </section>
    </div>
  );
}
