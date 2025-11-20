// src/pages/Explore.jsx
import React, { useEffect, useState, useRef } from "react";
import { getSupa, ensureUser } from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

// --- Config de viaje / mapa ----------------------------------------

const TRAVEL_SECONDS_DEFAULT = 300; // 5 min dev; el backend puede ignorar o ajustar
const AD_REDUCTION_SECONDS = 15; // lo que recorta ver un anuncio

// Islas basadas en tus coordenadas reales
const RAW_ISLANDS = [
  {
    key: "bahia_ajolote",
    name: "Bahía del Ajolote",
    description: "Parque México",
    region: "Centro",
    lat: 19.411571,
    lng: -99.16977,
    mapState: "Revelada en el pergamino",
  },
  {
    key: "campanas_blancas",
    name: "Isla de las Campanas Blancas",
    description: "Bellas Artes",
    region: "Centro",
    lat: 19.434789,
    lng: -99.14137,
    mapState: "Trazos incompletos (mapa parcial)",
  },
  {
    key: "cala_rey_errante",
    name: "Cala del Rey Errante",
    description: "Chapultepec",
    region: "Poniente",
    lat: 19.442997,
    lng: -99.176166,
    mapState: "Trazos incompletos (mapa parcial)",
  },
  {
    key: "refugio_hermandad",
    name: "Refugio de la Hermandad Kaminari",
    description: "Casa de tu amigo",
    region: "Norte",
    lat: 19.511338,
    lng: -99.092822,
    mapState: "Tinta rara… podría ser falso",
  },
  {
    key: "gaviotas_negras",
    name: "Bahía de las Gaviotas Negras",
    description: "Zona poniente",
    region: "Poniente",
    lat: 19.420407,
    lng: -99.138805,
    mapState: "Trazos incompletos (mapa parcial)",
  },
  {
    key: "mercado_koyo",
    name: "Mercado Coral de Köyō",
    description: "Centro Coyoacán",
    region: "Sur",
    lat: 19.349901,
    lng: -99.16237,
    mapState: "Trazos incompletos (mapa parcial)",
  },
];

// Normalizar lat/lng a [0,1] para el minimapa
function buildIslandsWithCoords() {
  const lats = RAW_ISLANDS.map((i) => i.lat);
  const lngs = RAW_ISLANDS.map((i) => i.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;

  return RAW_ISLANDS.map((i) => {
    const x = (i.lng - minLng) / lngSpan;
    const y = 1 - (i.lat - minLat) / latSpan; // invertimos para que norte quede arriba
    return { ...i, x, y };
  });
}

const ISLANDS = buildIslandsWithCoords();

function findIslandByNameOrKey(value) {
  if (!value) return null;
  return (
    ISLANDS.find((i) => i.key === value) ||
    ISLANDS.find((i) => i.name === value) ||
    null
  );
}

// -------------------------------------------------------------------

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState("");
  const [user, setUser] = useState(null);

  const [shipState, setShipState] = useState({
    status: "idle",
    currentLocation: "Desconocida",
    destination: null,
    progressPercent: 0,
    remainingSeconds: 0,
  });

  const [visitedKeys, setVisitedKeys] = useState(new Set());
  const [loadingTravelAction, setLoadingTravelAction] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);

  const lastShipStatusRef = useRef(null);
  const pollTimerRef = useRef(null);

  // ---------------------- Carga inicial -----------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setInitialError("");

      try {
        const supa = getSupa();
        const { user: u } = await ensureUser(supa);
        if (!u) throw new Error("No se pudo obtener el usuario.");

        if (cancelled) return;

        setUser(u);

        await Promise.all([loadShipState(supa, u.id), loadDiscovery(supa, u.id)]);
        setLoading(false);
      } catch (err) {
        console.error("[Explore] Error inicial:", err);
        if (!cancelled) {
          setInitialError(err.message || "Ocurrió un error al cargar la página.");
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
      clearPollTimer();
    };
  }, []);

  // ---------------------- Poll de progreso --------------------------

  useEffect(() => {
    clearPollTimer();
    if (!user || shipState.status !== "traveling") return;

    const supa = getSupa();
    pollTimerRef.current = setInterval(() => {
      refreshTravelProgress(supa, user.id);
    }, 3000);

    return clearPollTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipState.status, user?.id]);

  function clearPollTimer() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // ---------------------- Helpers de carga --------------------------

  async function loadShipState(supa, userId) {
    try {
      const { data, error } = await supa.rpc("ship_get_state", {
        p_user_id: userId,
      });

      if (error) throw error;
      if (!data || data.ok === false) {
        throw new Error(data?.error || "No se pudo obtener el estado del barco.");
      }

      const nextStatus = data.status || "idle";

      const nextState = {
        status: nextStatus,
        currentLocation: data.current_location || "Desconocida",
        destination: data.destination || null,
        origin: data.origin || null,
        departureTime: data.departure_time || null,
        arrivalTime: data.arrival_time || null,
        progressPercent: 0,
        remainingSeconds: 0,
      };

      // Detectar llegada (traveling -> idle)
      if (lastShipStatusRef.current === "traveling" && nextStatus === "idle") {
        const loc = nextState.currentLocation || "tu destino";
        toast.success(`Tu barco ha llegado a ${loc}.`);
        document.title = "⛵ PirateWorld – En puerto";
        // refrescamos descubrimientos al llegar
        await loadDiscovery(supa, userId);
      }

      lastShipStatusRef.current = nextStatus;

      // Cambiar título según estado
      if (nextStatus === "traveling") {
        document.title = "⛵ PirateWorld – En viaje…";
      } else {
        document.title = "⛵ PirateWorld – En puerto";
      }

      // Si está viajando, pedimos progreso
      if (nextStatus === "traveling") {
        const progress = await refreshTravelProgress(supa, userId, nextState);
        setShipState(progress);
      } else {
        setShipState(nextState);
      }
    } catch (err) {
      console.error("ship_get_state error:", err);
      throw err;
    }
  }

  async function refreshTravelProgress(supa, userId, baseStateOverride = null) {
    const base = baseStateOverride || shipState;

    try {
      const { data, error } = await supa.rpc("ship_travel_progress", {
        p_user_id: userId,
      });

      if (error) throw error;
      if (!data || data.ok === false) {
        // si el backend dice que ya no está viajando, mejor recargamos todo
        if (data?.error === "no_active_travel") {
          await loadShipState(supa, userId);
        }
        return base;
      }

      const percent = Math.min(
        100,
        Math.max(0, (data.percent || 0) * 100)
      );

      const remaining = data.remaining_seconds ?? 0;

      const merged = {
        ...base,
        status: data.traveling ? "traveling" : "idle",
        currentLocation: data.origin || base.currentLocation,
        destination: data.destination || base.destination,
        departureTime: data.departure_time || base.departureTime,
        arrivalTime: data.arrival_time || base.arrivalTime,
        progressPercent: percent,
        remainingSeconds: remaining,
      };

      setShipState(merged);
      return merged;
    } catch (err) {
      console.error("ship_travel_progress error:", err);
      return baseStateOverride || shipState;
    }
  }

  async function loadDiscovery(supa, userId) {
    try {
      const { data, error } = await supa
        .from("user_island_discovery")
        .select("island_key")
        .eq("user_id", userId);

      if (error) throw error;

      const keys = new Set();
      (data || []).forEach((row) => {
        if (row.island_key) keys.add(row.island_key);
      });
      setVisitedKeys(keys);
    } catch (err) {
      console.error("user_island_discovery error:", err);
    }
  }

  // ---------------------- Acciones de usuario -----------------------

  async function handleTravel(islandKey) {
    if (!user || !user.id) {
      toast.error("No se encontró el usuario.");
      return;
    }
    const supa = getSupa();
    const island = ISLANDS.find((i) => i.key === islandKey);
    if (!island) {
      toast.error("Isla desconocida.");
      return;
    }

    if (shipState.status === "traveling") {
      toast("Ya estás navegando, espera a llegar.", { icon: "⛵" });
      return;
    }

    try {
      setLoadingTravelAction(true);

      const { data, error } = await supa.rpc("ship_travel_start", {
        p_destination: island.name,
        p_duration_seconds: TRAVEL_SECONDS_DEFAULT,
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data || data.ok === false) {
        throw new Error(
          data?.error || "No se pudo iniciar el viaje del barco."
        );
      }

      toast.success(`Zarpando hacia ${island.name}…`);
      await loadShipState(supa, user.id);
    } catch (err) {
      console.error("ship_travel_start error:", err);
      toast.error(err.message || "No se pudo iniciar el viaje.");
    } finally {
      setLoadingTravelAction(false);
    }
  }

  async function handleForceArrival() {
    if (!user || !user.id) return;
    const supa = getSupa();

    try {
      const { data, error } = await supa.rpc("ship_force_arrival", {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data || data.ok === false) {
        throw new Error(
          data?.error || "No se pudo forzar la llegada del barco."
        );
      }

      toast.success("Llegada forzada (DEV).");
      await loadShipState(supa, user.id);
    } catch (err) {
      console.error("ship_force_arrival error:", err);
      toast.error("No se pudo forzar la llegada (DEV).");
    }
  }

  async function handleWatchAdDuringTravel() {
    if (!user || !user.id) {
      toast.error("No se encontró el usuario.");
      return;
    }
    if (shipState.status !== "traveling") {
      toast("Solo puedes ver este anuncio mientras el barco navega.", {
        icon: "⛵",
      });
      return;
    }

    try {
      setWatchingAd(true);
      const supa = getSupa();

      const { data, error } = await supa.rpc("ad_watch_during_travel", {
        p_user_id: user.id,
        p_soft_coins: 1,
        p_xp: 5,
        p_seconds: AD_REDUCTION_SECONDS,
      });

      if (error) throw error;
      if (!data || data.ok === false) {
        throw new Error(
          data?.error || "No se pudo registrar el anuncio."
        );
      }

      toast.success(
        "Has ganado +1 doblón, algo de XP y tu barco acelera un poco."
      );

      await loadShipState(supa, user.id);
    } catch (err) {
      console.error("ad_watch_during_travel error:", err);
      toast.error("No se pudo procesar el anuncio.");
    } finally {
      setWatchingAd(false);
    }
  }

  // ---------------------- Render helpers ----------------------------

  function formatSeconds(total) {
    if (!total || total <= 0) return "0s";
    const s = Math.floor(total % 60);
    const m = Math.floor(total / 60);
    if (m <= 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  function renderShipStatus() {
    if (shipState.status === "traveling") return "Navegando…";
    return "En puerto (idle)";
  }

  function getShipLocationLabel() {
    return shipState.currentLocation || "Desconocida";
  }

  function getShipDestinationLabel() {
    if (shipState.status !== "traveling") return "—";
    return shipState.destination || "Destino desconocido";
  }

  function isIslandVisited(i) {
    return (
      visitedKeys.has(i.key) ||
      visitedKeys.has(i.name) // por si quedó algo viejo
    );
  }

  function getShipIslandForMiniMap() {
    const loc = shipState.currentLocation;
    if (!loc) return null;
    const match = findIslandByNameOrKey(loc);
    return match;
  }

  // ---------------------- Render principal --------------------------

  return (
    <div className="page-container">
      <header className="ledger-header">
        <h1 className="big">Explorar el mar</h1>
        <p className="ledger-subtitle">
          Navega entre puntos reales de la ciudad como si fueran{" "}
          <strong>islas pirata</strong>. Tu barco viaja más rápido que en la vida
          real, pero usa coordenadas reales para que aprendas a leer el mapa del
          mundo.
        </p>
      </header>

      {initialError && (
        <div className="card ledger-card ledger-error" style={{ marginBottom: 16 }}>
          <p>Ocurrió un error:</p>
          <code>{initialError}</code>
        </div>
      )}

      {/* Estado del barco */}
      <section className="card ledger-card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Estado del barco</h2>

        {loading ? (
          <p className="muted">Cargando estado del barco…</p>
        ) : (
          <>
            <p style={{ marginBottom: 4 }}>
              <strong>Estado:</strong> {renderShipStatus()}
            </p>
            <p style={{ marginBottom: 4 }}>
              <strong>Ubicación actual:</strong> {getShipLocationLabel()}
            </p>
            <p style={{ marginBottom: 12 }}>
              <strong>Rumbo a:</strong> {getShipDestinationLabel()}
            </p>

            <div
              className="progress-bar-wrap"
              style={{ marginTop: 8, marginBottom: 4 }}
            >
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${shipState.progressPercent ?? 0}%` }}
                />
              </div>
              <div
                className="progress-bar-label"
                style={{ fontSize: 12, marginTop: 4 }}
              >
                Progreso del viaje:{" "}
                <strong>{Math.round(shipState.progressPercent ?? 0)}%</strong>
                {shipState.status === "traveling" && (
                  <> · Tiempo restante aprox:{" "}
                    {formatSeconds(shipState.remainingSeconds)}</>
                )}
              </div>
            </div>

            {shipState.status === "traveling" && (
              <div
                className="card"
                style={{
                  marginTop: 12,
                  padding: 12,
                  background:
                    "linear-gradient(90deg, rgba(12,26,48,1) 0%, rgba(18,40,70,1) 100%)",
                  borderRadius: 12,
                  border: "1px solid rgba(80, 140, 255, 0.4)",
                }}
              >
                <p style={{ marginBottom: 8, fontSize: 14 }}>
                  Tu barco va en ruta a{" "}
                  <strong>{getShipDestinationLabel()}</strong>. Mientras
                  navega, puedes ver un anuncio para ganar{" "}
                  <strong>+1 doblón</strong> y un poco de <strong>XP</strong>, y
                  además acelerar ligeramente este viaje.
                </p>

                <button
                  onClick={handleWatchAdDuringTravel}
                  disabled={watchingAd}
                  className="btn btn-primary"
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    fontSize: 14,
                    opacity: watchingAd ? 0.7 : 1,
                    cursor: watchingAd ? "wait" : "pointer",
                  }}
                >
                  {watchingAd
                    ? "Registrando anuncio..."
                    : "Ver anuncio (+1 doblón)"}
                </button>

                <p
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    opacity: 0.7,
                  }}
                >
                  Tip: más adelante aquí podrás ver anuncios reales mientras
                  esperas el tiempo de viaje.
                </p>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={handleForceArrival}
                disabled={!user}
              >
                Forzar llegada (DEV)
              </button>
            </div>
          </>
        )}
      </section>

      {/* Mini-mapa pirata */}
      <section className="card ledger-card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Mini-mapa pirata</h2>
        <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
          Pulsa una isla para zarpar. Las islas{" "}
          <span style={{ fontWeight: 600 }}>ya visitadas</span> brillan en
          dorado; las demás aparecen más discretas, como si el mapa estuviera
          apenas bocetado.
        </p>

        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "60%",
            background:
              "radial-gradient(circle at top, #111827 0, #020617 55%, #020617 100%)",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          {ISLANDS.map((island) => {
            const visited = isIslandVisited(island);
            const top = island.y * 100;
            const left = island.x * 100;

            const isCurrent =
              getShipIslandForMiniMap()?.key === island.key &&
              shipState.status !== "traveling";

            return (
              <button
                key={island.key}
                type="button"
                onClick={() => handleTravel(island.key)}
                disabled={loadingTravelAction}
                style={{
                  position: "absolute",
                  top: `${top}%`,
                  left: `${left}%`,
                  transform: "translate(-50%, -50%)",
                  padding: "3px 10px",
                  fontSize: 11,
                  borderRadius: 999,
                  border: isCurrent
                    ? "1px solid rgba(250, 204, 21, 0.9)"
                    : "1px solid rgba(59, 130, 246, 0.65)",
                  background: visited
                    ? "radial-gradient(circle, rgba(250,204,21,0.18) 0, rgba(15,23,42,0.95) 60%)"
                    : "rgba(15,23,42,0.95)",
                  color: visited ? "#fde68a" : "#bfdbfe",
                  cursor: "pointer",
                  boxShadow: visited
                    ? "0 0 16px rgba(250,204,21,0.35)"
                    : "0 0 8px rgba(37,99,235,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {isCurrent ? "⚓ " : "⛵ "}
                {island.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tabla de islas conocidas */}
      <section className="card ledger-card">
        <h2 className="section-title">Islas conocidas</h2>
        <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
          Toca una isla en la tabla o en el minimapa para zarpar. Más adelante,
          los mapas se podrán comprar por isla o región, algunos serán falsos y
          solo al llegar descubrirás la verdad, y el pergamino se irá dibujando
          poco a poco.
        </p>

        <div className="ledger-table-wrap">
          <div className="ledger-table-scroll">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Isla</th>
                  <th>Región</th>
                  <th>Estado del mapa</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ISLANDS.map((island) => {
                  const visited = isIslandVisited(island);
                  const isCurrent =
                    getShipIslandForMiniMap()?.key === island.key &&
                    shipState.status !== "traveling";

                  return (
                    <tr key={island.key}>
                      <td>
                        {island.name}
                        <br />
                        <span className="muted" style={{ fontSize: 11 }}>
                          {island.description}
                        </span>
                      </td>
                      <td>{island.region}</td>
                      <td>
                        {island.mapState}
                        {visited && (
                          <span style={{ marginLeft: 6, fontSize: 11 }}>
                            · <strong>Visitada</strong>
                          </span>
                        )}
                      </td>
                      <td>
                        {isCurrent ? (
                          <span className="badge">Aquí estás</span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            disabled={loadingTravelAction}
                            onClick={() => handleTravel(island.key)}
                          >
                            Zarpar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Futuro: podrás comprar mapas por isla o región, algunos serán falsos y
          solo al llegar descubrirás la verdad. El minimapa crecerá hasta cubrir
          colonias completas del mundo real.
        </p>
      </section>
    </div>
  );
}
