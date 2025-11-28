// src/pages/Ship.jsx
import React, { useEffect, useState } from "react";
import { getSupa, ensureUser, getShipState } from "../lib/supaApi.js";

const FALLBACK_EMAIL = "worm_jim@hotmail.com";

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  return fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
}

export default function ShipPage() {
  const [user, setUser] = useState(null);
  const [ship, setShip] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [customDestination, setCustomDestination] = useState("");

  // ----------------------------------------------------
  // Cargar usuario + estado del barco
  // ----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setErrorMsg("");

      try {
        const { user: u } = await ensureUser(getCurrentEmail());
        if (cancelled) return;

        setUser(u);

        const data = await getShipState(u.id);

        if (!data) {
          setShip(null);
          setStatus("ready");
          return;
        }

        setShip({
          userId: user.id,
          currentLocation: data.from_island || data.to_island || "Desconocido",
          status: data.status || "idle",
          fromIsland: data.from_island,
          toIsland: data.to_island,
          etaAt: data.eta_at,
          updatedAt: data.updated_at || null,
          currentLat: data.current_lat,
          currentLng: data.current_lng,
          progressPercent: data.progress_percent,
          distanceKm: data.distance_km,
          speedKmh: data.speed_kmh,
        });
        setStatus("ready");
      } catch (err) {
        console.error("[ship] Error cargando estado ship_get_state_v3:", err);
        if (!cancelled) {
          setErrorMsg(err.message || "No se pudo cargar el barco.");
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);



  // ----------------------------------------------------
  // Reload ship state
  // ----------------------------------------------------
  async function reloadShip() {
    if (!user) return;
    try {
      const data = await getShipState(user.id);

      if (!data) {
        setShip(null);
        return;
      }

      setShip({
        userId: user.id,
        currentLocation: data.from_island || data.to_island || "Desconocido",
        status: data.status || "idle",
        fromIsland: data.from_island,
        toIsland: data.to_island,
        etaAt: data.eta_at,
        updatedAt: data.updated_at || null,
        currentLat: data.current_lat,
        currentLng: data.current_lng,
        progressPercent: data.progress_percent,
        distanceKm: data.distance_km,
        speedKmh: data.speed_kmh,
      });
    } catch (err) {
      console.error("[ship] Error recargando estado ship_get_state_v3:", err);
      setErrorMsg(err.message || "No se pudo recargar el barco.");
      setStatus("error");
    }
  }

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  if (status === "loading") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Barco</h1>
        <p className="muted">Cargando estado del barco…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page-container ledger-page">
        <h1 className="big">Barco</h1>
        <p className="ledger-error">
          Ocurrió un error al cargar el barco:
          <br />
          <code>{errorMsg}</code>
        </p>
        <button
          type="button"
          onClick={reloadShip}
          style={{ marginTop: 12 }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="page-container ledger-page">
      <header className="ledger-header">
        <h1 className="big">Estado del barco</h1>
        <p className="ledger-subtitle">
          Aquí ves <strong>dónde está tu barco</strong> y puedes hacer viajes
          simples a otros destinos de prueba. Más adelante esto crecerá a un
          sistema de navegación con tiempos, costos y eventos.
        </p>
      </header>

      <div className="card ledger-card">
        {user && (
          <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
            Capitán: <strong>{user.email}</strong>
          </p>
        )}

        {ship ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Ubicación actual</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {ship.currentLocation}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Estado</div>
              <div style={{ fontSize: 14 }}>
                {ship.status === "idle" && "En reposo (sin viajar)"}
                {ship.status === "traveling" && "Viajando"}
                {ship.status === "arrived" && "Ha llegado"}
                {ship.status !== "idle" && ship.status !== "traveling" && ship.status !== "arrived" && ship.status}
              </div>
            </div>

            {ship.fromIsland && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Desde</div>
                <div style={{ fontSize: 14 }}>{ship.fromIsland}</div>
              </div>
            )}

            {ship.toIsland && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Hacia</div>
                <div style={{ fontSize: 14 }}>{ship.toIsland}</div>
              </div>
            )}

            {ship.currentLat && ship.currentLng && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Posición GPS</div>
                <div style={{ fontSize: 14 }}>
                  {ship.currentLat.toFixed(6)}, {ship.currentLng.toFixed(6)}
                </div>
              </div>
            )}

            {ship.progressPercent !== undefined && ship.status === "traveling" && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Progreso del viaje</div>
                <div style={{ fontSize: 14 }}>
                  {ship.progressPercent.toFixed(1)}%
                </div>
              </div>
            )}

            {ship.distanceKm && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Distancia total</div>
                <div style={{ fontSize: 14 }}>
                  {ship.distanceKm.toFixed(1)} km
                </div>
              </div>
            )}

            {ship.speedKmh && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>Velocidad</div>
                <div style={{ fontSize: 14 }}>
                  {ship.speedKmh} km/h
                </div>
              </div>
            )}

            {ship.etaAt && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, opacity: 0.75 }}>ETA (Hora estimada de llegada)</div>
                <div style={{ fontSize: 14 }}>
                  {new Date(ship.etaAt).toLocaleString()}
                </div>
              </div>
            )}

            {ship.updatedAt && (
              <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                Última actualización:{" "}
                <code>{new Date(ship.updatedAt).toLocaleString()}</code>
              </div>
            )}
          </>
        ) : (
          <p className="muted">
            Aún no hay estado de barco registrado. Haz un viaje para crearlo.
          </p>
        )}

        {errorMsg && (
          <p className="ledger-error" style={{ marginTop: 8 }}>
            {errorMsg}
          </p>
        )}

        <hr style={{ margin: "16px 0", borderColor: "rgba(148,163,184,0.3)" }} />

        <h3 style={{ marginTop: 0 }}>Navegación</h3>
        <p className="muted" style={{ marginBottom: 8 }}>
          Para iniciar nuevos viajes y ver el progreso en tiempo real, 
          utiliza la página de <strong>Explorar</strong>. Allí podrás:
        </p>
        
        <ul className="muted" style={{ marginBottom: 12, paddingLeft: 20 }}>
          <li>Ver todas las islas disponibles</li>
          <li>Iniciar viajes con GPS real</li>
          <li>Ver el progreso del viaje en tiempo real</li>
          <li>Ver anuncios para reducir el tiempo de viaje</li>
          <li>Forzar llegada (solo desarrollo)</li>
        </ul>

        <button
          type="button"
          onClick={() => window.location.href = "/explore"}
          style={{
            background: "#1e40af",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Ir a Explorar →
        </button>
      </div>

      <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>
        Sistema de navegación v3 con GPS en tiempo real, progreso de viaje y recompensas por anuncios.
      </p>
    </div>
  );
}
