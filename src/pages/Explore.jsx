// src/pages/Explore.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getSupa,
  ensureUser,
  getShipState,
  startShipTravel,
  forceShipArrival,
} from "../lib/supaApi.js";
import { toast } from "react-hot-toast";

// --- Config de viaje / mapa ----------------------------------------

const TRAVEL_SECONDS_DEFAULT = 600; // 10 minutos como define el backend
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

// 👇 Normalizador genérico de respuestas del barco
function normalizeShipState(raw) {
  if (!raw) return null;

  let data = raw;

  // Si viene como array: [ {...} ]
  if (Array.isArray(data)) {
    data = data[0] ?? null;
  }

  // Si viene anidado: { ship_state: {...} }
  if (data && data.ship_state) {
    data = data.ship_state;
  }

  // Debug de campos esperados
  if (data && typeof data === "object") {
    console.log("[Explore] normalizeShipState valid fields:", {
      status: data.status,
      from_island: data.from_island,
      to_island: data.to_island,
      started_at: data.started_at,
      eta_at: data.eta_at,
      server_now: data.server_now,
    });
  }

  return data || null;
}
// -------------------------------------------------------------------

export default function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState("");
  const [user, setUser] = useState(null);

  const [shipStatus, setShipStatus] = useState("idle");
  const [fromIsland, setFromIsland] = useState(null);
  const [toIsland, setToIsland] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [etaAt, setEtaAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [serverNow, setServerNow] = useState(null);

  const [visitedKeys, setVisitedKeys] = useState(new Set());
  const [loadingTravelAction, setLoadingTravelAction] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);

  const lastShipStatusRef = useRef(null);
  const pollTimerRef = useRef(null);


  // ---------------------- Carga inicial -----------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      console.log("[Explore] loadInitial() start");
      setLoading(true);
      setInitialError("");

      try {
        // Usuario demo
        const { user: u } = await ensureUser("worm_jim@hotmail.com");
        if (!u) throw new Error("No se pudo obtener el usuario.");

        if (cancelled) return;

        console.log("[Explore] user OK", u.id);
        setUser(u);

        await loadShipState(u.id);
        await loadDiscovery(u.id);

        console.log("[Explore] loadInitial() done");
        setLoading(false);
      } catch (err) {
        console.error("[Explore] Error inicial:", err);
        if (!cancelled) {
          setInitialError(
            err.message || "Ocurrió un error al cargar la página."
          );
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
    if (!user || shipStatus !== "traveling") return;

    pollTimerRef.current = setInterval(() => {
      loadShipState();
    }, 5000);

    return clearPollTimer;
  }, [shipStatus, user?.id]);

  // ---------------------- Contador local 1s --------------------------
// Este efecto solo vive mientras el barco está viajando.
// Baja remainingTime de 1 en 1 segundo en el frontend.

useEffect(() => {
  if (shipStatus !== "traveling") return;

  const intervalId = setInterval(() => {
    setRemainingTime((prev) => {
      if (!prev || prev <= 0) return 0;
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(intervalId);
}, [shipStatus]);

  function clearPollTimer() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // ---------------------- Helpers de carga --------------------------

  async function loadShipState(userIdOverride) {
    try {
      const effectiveUserId = userIdOverride ?? user?.id;

      if (!effectiveUserId) {
        console.warn("[Explore] loadShipState llamado sin userId");
        return;
      }

      console.log("[Explore] loadShipState, userId =", effectiveUserId);
      const raw = await getShipState(effectiveUserId);
      console.log("[Explore] ship state raw:", raw);

      const data = normalizeShipState(raw);
      console.log("[Explore] ship state normalized:", data);

      if (!data) {
        throw new Error("No se pudo obtener el estado del barco.");
      }

      const nextStatus = data.status || "idle";

      setShipStatus(nextStatus);
      setFromIsland(data.from_island ?? null);
      setToIsland(data.to_island ?? null);
      setStartedAt(data.started_at ?? null);
      setEtaAt(data.eta_at ?? null);
      setServerNow(data.server_now ?? null);

      if (nextStatus === "traveling" && data.eta_at && data.server_now) {
        const etaMs = Date.parse(data.eta_at);
        const nowMs = Date.parse(data.server_now);
        if (!Number.isNaN(etaMs) && !Number.isNaN(nowMs)) {
          const diffSec = Math.max(0, Math.round((etaMs - nowMs) / 1000));
          setRemainingTime(diffSec);
        } else {
          setRemainingTime(0);
        }
      } else {
        setRemainingTime(0);
      }

      if (
        lastShipStatusRef.current === "traveling" &&
        nextStatus === "arrived"
      ) {
        toast.success(
          `Tu barco ha llegado a ${data.to_island || "tu destino"}.`
        );
        document.title = "⛵ PirateWorld – En puerto";
        if (effectiveUserId) {
          await loadDiscovery(effectiveUserId);
        }
      }

      lastShipStatusRef.current = nextStatus;

      if (nextStatus === "traveling") {
        document.title = "⛵ PirateWorld – En viaje…";
      } else {
        document.title = "⛵ PirateWorld – En puerto";
      }
    } catch (err) {
      console.error("loadShipState error:", err);
      throw err;
    }
  }

  async function loadDiscovery(userId) {
    try {
      const supa = getSupa();
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

    const island = ISLANDS.find((i) => i.key === islandKey);
    if (!island) {
      toast.error("Isla desconocida.");
      return;
    }

    if (shipStatus === "traveling") {
      toast("Ya estás navegando, espera a llegar.", { icon: "⛵" });
      return;
    }

    try {
      setLoadingTravelAction(true);
      console.log("[Explore] startShipTravel →", {
        userId: user.id,
        to: island.name,
      });

      const raw = await startShipTravel(user.id, island.name);
      console.log("[Explore] startShipTravel raw:", raw);

      toast.success(`Zarpando hacia ${island.name}…`);
      await loadShipState(user.id);
    } catch (err) {
      console.error("startShipTravel error:", err);
      toast.error(err.message || "No se pudo iniciar el viaje.");
    } finally {
      setLoadingTravelAction(false);
    }
  }

  async function handleForceArrival() {
    if (!user || !user.id) return;

    try {
      const raw = await forceShipArrival(user.id);
      console.log("[Explore] forceShipArrival raw:", raw);

      if (!raw) {
        throw new Error("No se pudo forzar la llegada del barco.");
      }

      toast.success("Llegada forzada (DEV).");
      await loadShipState(user.id);
    } catch (err) {
      console.error("forceShipArrival error:", err);
      toast.error("No se pudo forzar la llegada (DEV).");
    }
  }

  async function handleWatchAdDuringTravel() {
  if (!user || !user.id) {
    toast.error("No se encontró el usuario.");
    return;
  }
  if (shipStatus !== "traveling") {
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

    console.log("[Explore] ad_watch_during_travel:", { data, error });

    if (error) throw error;
    if (!data || data.ok === false) {
      throw new Error(data?.error || "No se pudo registrar el anuncio.");
    }

    // 🔽 Actualizamos el contador local inmediatamente
    setRemainingTime((prev) => {
      const safePrev = typeof prev === "number" ? prev : 0;
      return Math.max(0, safePrev - AD_REDUCTION_SECONDS);
    });

    toast.success(
      "Has ganado +1 doblón, algo de XP y tu barco acelera un poco."
    );

    // Luego sincronizamos con el backend (por si hay diferencia)
    await loadShipState(user.id);
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
    if (shipStatus === "traveling") return "Viajando";
    if (shipStatus === "arrived") return "Ha llegado";
    if (shipStatus === "idle") return "En puerto";
    return "En puerto";
  }

  function getShipLocationLabel() {
    if (shipStatus === "traveling") {
      return toIsland || "Destino desconocido";
    }
    return fromIsland || "Puerto principal";
  }

  function getShipDestinationLabel() {
    if (shipStatus !== "traveling") return "—";
    return toIsland || "Destino desconocido";
  }

  function isIslandVisited(i) {
    return (
      visitedKeys.has(i.key) ||
      visitedKeys.has(i.name)
    );
  }

  function getShipIslandForMiniMap() {
    const loc = fromIsland;
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
          <strong>islas pirata</strong>.
        </p>
      </header>

      {initialError && (
        <div
          className="card ledger-card ledger-error"
          style={{ marginBottom: 16 }}
        >
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

            {shipStatus === "traveling" && (
              <>
                <p style={{ marginBottom: 4 }}>
                  <strong>Desde:</strong> {fromIsland || "Origen desconocido"}
                </p>

                <p style={{ marginBottom: 4 }}>
                  <strong>Hacia:</strong> {toIsland || "Destino desconocido"}
                </p>

                <p style={{ marginBottom: 12 }}>
                  <strong>Llegada estimada:</strong>{" "}
                  {etaAt
                    ? new Date(etaAt).toLocaleString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })
                    : "Desconocida"}
                </p>
              </>
            )}

            {shipStatus !== "traveling" && (
              <p style={{ marginBottom: 12 }}>
                <strong>Rumbo a:</strong> {getShipDestinationLabel()}
              </p>
            )}

            {shipStatus === "traveling" && (
              <>
                {/* Barra de progreso */}
                <div
                  className="progress-bar-wrap"
                  style={{ marginTop: 8, marginBottom: 4 }}
                >
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((TRAVEL_SECONDS_DEFAULT - remainingTime) /
                              TRAVEL_SECONDS_DEFAULT) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div
                    className="progress-bar-label"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    Tiempo restante:{" "}
                    <strong>{formatSeconds(remainingTime)}</strong>
                  </div>
                </div>

                {/* Anuncio durante viaje */}
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
                    <strong>+1 doblón</strong> y algo de <strong>XP</strong>, y
                    además acelerar ligeramente el viaje.
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
                    Tip: más adelante podrás ver videos reales para reducir el
                    tiempo de navegación.
                  </p>
                </div>

                {/* Botón dev */}
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

            {shipStatus === "arrived" && (
              <div style={{ marginTop: 12 }}>
                <p style={{ marginBottom: 8, color: "#10b981" }}>
                  ✅ Tu barco ha llegado a <strong>{toIsland}</strong>
                </p>

                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await forceShipArrival(user.id);
                      toast.success("Viaje finalizado. ¡Bienvenido a puerto!");
                      await loadShipState(user.id);
                    } catch (err) {
                      toast.error("No se pudo finalizar el viaje");
                    }
                  }}
                >
                  Atracar / Finalizar viaje
                </button>
              </div>
            )}

            {shipStatus === "idle" && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: "#6b7280", fontSize: 14 }}>
                  ⚓ Tu barco está en puerto. Selecciona una isla para zarpar.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Mini-mapa pirata */}
      <section className="card ledger-card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Mini-mapa pirata</h2>

        <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
          Pulsa una isla para zarpar. Las islas{" "}
          <span style={{ fontWeight: 600 }}>ya visitadas</span> brillan en
          dorado.
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
              shipStatus !== "traveling";

            return (
              <button
                key={island.key}
                type="button"
                onClick={() => handleTravel(island.key)}
                disabled={loadingTravelAction || shipStatus === "traveling"}
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
                  cursor:
                    shipStatus === "traveling" ? "not-allowed" : "pointer",
                  boxShadow: visited
                    ? "0 0 16px rgba(250,204,21,0.35)"
                    : "0 0 8px rgba(37,99,235,0.35)",
                  whiteSpace: "nowrap",
                  opacity: shipStatus === "traveling" ? 0.6 : 1,
                }}
              >
                {isCurrent ? "⚓ " : "⛵ "}
                {island.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tabla de islas */}
      <section className="card ledger-card">
        <h2 className="section-title">Islas conocidas</h2>

        <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
          Toca una isla en la tabla o en el minimapa para zarpar.
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
                    shipStatus !== "traveling";

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
                            disabled={
                              loadingTravelAction || shipStatus === "traveling"
                            }
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
          Futuro: podrás comprar mapas por isla o región, algunos falsos y solo
          al llegar descubrirás cuál era verdadero.
        </p>
      </section>
    </div>
  );
}
