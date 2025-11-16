// Missions.jsx — Misiones diarias con rareza visual y reclamo de recompensa
import { useEffect, useRef, useState } from "react";
import { getSupa, ensureUser, getUserState } from "../lib/supaApi.js";
import ConfettiOverlay from "../components/ConfettiOverlay.jsx";

const DEFAULT_EMAIL = "worm_jim@hotmail.com";

function rarityLabel(r) {
  if (!r) return "COMÚN";
  switch (r) {
    case "rare":
      return "RARA";
    case "epic":
      return "ÉPICA";
    case "legendary":
      return "LEGENDARIA";
    default:
      return "COMÚN";
  }
}

function rarityClass(r) {
  switch (r) {
    case "rare":
      return "mission-rarity-pill mission-rarity-rare";
    case "epic":
      return "mission-rarity-pill mission-rarity-epic";
    case "legendary":
      return "mission-rarity-pill mission-rarity-legendary";
    default:
      return "mission-rarity-pill mission-rarity-common";
  }
}

export default function Missions() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const confettiRef = useRef(null);

  // Cargar usuario + misiones
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    setBanner("");

    try {
      const { user: u } = await ensureUser(DEFAULT_EMAIL);
      const supa = getSupa();

      // Misiones diarias (máx 5)
      const { data: missionsRaw, error: errM } = await supa
        .from("missions")
        .select(
          "id, code, title, description, rarity, reward_soft_coins, daily"
        )
        .eq("daily", true)
        .order("rarity", { ascending: false })
        .order("reward_soft_coins", { ascending: false })
        .limit(5);

      if (errM) throw errM;

      let enriched = missionsRaw || [];

      // Progreso del usuario
      if (enriched.length > 0) {
        const ids = enriched.map((m) => m.id);
        const { data: prog, error: errP } = await supa
          .from("mission_progress")
          .select("mission_id, done")
          .eq("user_id", u.id)
          .in("mission_id", ids);

        if (errP) throw errP;

        const map = new Map();
        (prog || []).forEach((row) => {
          map.set(row.mission_id, !!row.done);
        });

        enriched = enriched.map((m) => ({
          ...m,
          done: map.get(m.id) || false,
        }));
      }

      const freshUser = await getUserState({ userId: u.id });

      setUser(freshUser);
      setBalance(Number(freshUser.soft_coins ?? 0));
      setMissions(enriched);
    } catch (err) {
      console.error("Error cargando misiones:", err);
      setError(err.message || "No se pudieron cargar las misiones.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------
  // ⛵ NUEVO handleClaim → bloquea multi-reclamo + maneja already_completed
  // ---------------------------------------------------------------
  async function handleClaim(m) {
    if (!user?.id) return;
    if (m.done) return; // ya completada
    if (claimingId) return;

    setClaimingId(m.id);
    setBanner("");
    setError("");

    try {
      const supa = getSupa();

      // Llamada usando misión por code (backend así lo espera)
      const { data, error: errRpc } = await supa.rpc("complete_mission", {
        p_mission_code: m.code,
        p_user_id: user.id,
      });

      // ❌ Error general
      if (errRpc) {
        console.error("RPC complete_mission error:", errRpc);
        setBanner("No se pudo reclamar la recompensa de esta misión.");
        return;
      }

      // ❌ Ya reclamada anteriormente
      if (data?.error === "already_completed") {
        setBanner("Esta misión ya fue reclamada anteriormente.");
        // Marcamos localmente como completada
        setMissions((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, done: true } : x))
        );
        return;
      }

      // ❌ Respuesta inesperada
      if (!data?.ok) {
        console.error("RPC complete_mission error:", data);
        setBanner("No se pudo reclamar la recompensa de esta misión.");
        return;
      }

      // ✔ OK → pagamos, confetti, y refrescamos datos
      confettiRef.current?.fire("mission");

      if (typeof data.soft_coins === "number") {
        setBalance(data.soft_coins);
      }

      setMissions((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, done: true } : x))
      );

      setBanner("¡Recompensa reclamada correctamente!");

    } catch (err) {
      console.error("Error al reclamar misión:", err);
      setBanner("No se pudo reclamar la recompensa de esta misión.");
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className="page-container missions-page">
      <div className="missions-header card">
        <h1 className="big" style={{ marginBottom: 4 }}>
          Misiones diarias
        </h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Completa pequeñas tareas para ganar doblones extra y progresar en la
          historia pirata.
        </p>

        <div
          className="row"
          style={{ marginTop: 18, justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Usuario:</div>
            <div style={{ fontWeight: 600 }}>
              {user?.email || DEFAULT_EMAIL}
            </div>
          </div>
          <div className="store-balance-pill">
            <span>Saldo:</span>
            <strong>{balance ?? user?.soft_coins ?? 0}</strong>
            <span style={{ fontSize: 11 }}>doblones</span>
          </div>
        </div>
      </div>

      {banner && (
        <div className="card" style={{ color: "#fecaca", fontSize: 14 }}>
          {banner}
        </div>
      )}

      {error && (
        <div className="card" style={{ color: "#fecaca", fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Objetivos de hoy</h2>

        {loading && <p className="muted">Cargando misiones…</p>}

        {!loading && missions.length === 0 && (
          <p className="muted">No hay misiones disponibles por ahora.</p>
        )}

        {!loading && missions.length > 0 && (
          <div className="missions-list">
            {missions.map((m) => (
              <div key={m.id} className="mission-card">
                <div className="mission-main">
                  <h3>{m.title}</h3>
                  <p
                    className="muted"
                    style={{ margin: 0, fontSize: 14, maxWidth: 520 }}
                  >
                    {m.description}
                  </p>

                  <div className="mission-meta">
                    <span className={rarityClass(m.rarity)}>
                      {rarityLabel(m.rarity)}
                    </span>
                    {m.done && (
                      <span className="mission-status-pill">Completada</span>
                    )}
                  </div>
                </div>

                <div className="mission-reward">
                  <div className="mission-reward-amount">
                    {m.reward_soft_coins}
                  </div>
                  <div className="mission-reward-label">doblones</div>

                  <button
                    style={{ marginTop: 8, minWidth: 210 }}
                    onClick={() => handleClaim(m)}
                    disabled={m.done || claimingId === m.id || loading}
                  >
                    {m.done
                      ? "Recompensa reclamada"
                      : "Reclamar recompensa"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfettiOverlay ref={confettiRef} />
    </div>
  );
}
