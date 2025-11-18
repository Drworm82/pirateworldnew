// Missions.jsx — Misiones diarias con rareza visual, tripulación y reparto
import { useEffect, useRef, useState } from "react";
import { getSupa, ensureUser, getUserState } from "../lib/supaApi.js";
import ConfettiOverlay from "../components/ConfettiOverlay.jsx";
import "./Missions.css"; // 👈 nuevo: estilos de rareza y tarjetas

const FALLBACK_EMAIL = "worm_jim@hotmail.com";

function getCurrentEmail() {
  if (typeof window === "undefined") return FALLBACK_EMAIL;

  const fromDemo = window.localStorage.getItem("demoEmail");
  const fromDemoUser = window.localStorage.getItem("demoUserEmail");
  const fromLegacy = window.localStorage.getItem("userEmail");

  const email = fromDemo || fromDemoUser || fromLegacy || FALLBACK_EMAIL;
  return email;
}

// Normalizamos rareza de la DB (común, rara, épica, legendaria / common, rare, epic, legendary)
function normalizeRarity(r) {
  if (!r) return "common";
  const v = (r || "").toString().toLowerCase().trim();

  if (v.startsWith("com")) return "common"; // común / common
  if (v.startsWith("rar")) return "rare"; // rara / rare
  if (v.startsWith("ép") || v.startsWith("ep")) return "epic"; // épica / epic
  if (v.startsWith("leg")) return "legendary"; // legendaria / legendary

  return "common";
}

function rarityLabel(r) {
  const norm = normalizeRarity(r);
  switch (norm) {
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

function rarityPillClass(r) {
  const norm = normalizeRarity(r);
  return `mission-rarity-pill mission-rarity-${norm}`;
}

function missionCardClass(r) {
  const norm = normalizeRarity(r);
  return `mission-card mission-card-${norm}`;
}

export default function Missions() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(""); // solo errores
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [crewInfo, setCrewInfo] = useState(null);
  const [toast, setToast] = useState(""); // éxito en toast flotante
  const confettiRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Cargar usuario + misiones al montar la pantalla
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limpiar timeout de toast al desmontar
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function showToast(message) {
    setToast(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast("");
    }, 2500);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    setBanner("");

    try {
      const { user: u } = await ensureUser(getCurrentEmail());
      const supa = getSupa();

      // 1) Misiones diarias con "done" desde el backend
      const { data: missionsRaw, error: errM } = await supa.rpc(
        "missions_get_daily_for_user",
        { p_user_id: u.id }
      );

      if (errM) throw errM;

      const enriched = (missionsRaw || []).map((m) => ({
        ...m,
        done: !!m.done,
      }));

      // 2) Estado del usuario (saldo, etc.)
      const freshUser = await getUserState({ userId: u.id });

      setUser(freshUser);
      setBalance(Number(freshUser.soft_coins ?? 0));
      setMissions(enriched);

      // 3) Info ligera de tripulación para mostrar en la UI
      try {
        const { data: crewData, error: crewErr } = await supa.rpc(
          "crew_get_my_crew",
          { p_user_id: u.id }
        );

        if (!crewErr && crewData && crewData.in_crew && crewData.crew) {
          const c = crewData.crew;
          const me = c.me;
          const members = c.members || [];
          const myMember =
            members.find((m) => m.user_id === me?.user_id) || me || null;

          let myRole = "Miembro";
          if (me?.user_id === c.captain_id) {
            myRole = "Capitán";
          } else if (myMember?.role_name && myMember.role_name.trim() !== "") {
            myRole = myMember.role_name.trim();
          }

          const myPercent =
            typeof myMember?.share_percent === "number"
              ? myMember.share_percent
              : null;

          setCrewInfo({
            name: c.name,
            myRole,
            mySharePercent: myPercent,
          });
        } else {
          setCrewInfo(null);
        }
      } catch (crewErr) {
        console.error("Error cargando info de crew en Misiones:", crewErr);
        setCrewInfo(null);
      }
    } catch (err) {
      console.error("Error cargando misiones:", err);
      setError(err.message || "No se pudieron cargar las misiones.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------
  // FE-18: Reclamar → checar conexión + RPC + confetti + saldo + done local
  // ---------------------------------------------------------------
  async function handleClaim(m) {
    if (!user?.id) return;
    if (m.done) return; // ya completada
    if (claimingId) return;

    // Sin conexión a internet → mensaje inmediato (error = banner)
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setBanner(
        "Sin conexión a internet. No se pudo reclamar la recompensa de esta misión."
      );
      return;
    }

    setClaimingId(m.id);
    setBanner("");
    setError("");

    try {
      const supa = getSupa();

      const { data, error: errRpc } = await supa.rpc("complete_mission", {
        p_mission_code: m.code,
        p_user_id: user.id,
      });

      if (errRpc) {
        console.error("RPC complete_mission error:", errRpc);
        setBanner("No se pudo reclamar la recompensa de esta misión.");
        return;
      }

      if (data?.error === "already_completed") {
        setBanner("Esta misión ya fue reclamada anteriormente.");
        setMissions((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, done: true } : x))
        );
        return;
      }

      if (!data?.ok) {
        console.error("RPC complete_mission respuesta inesperada:", data);
        setBanner("No se pudo reclamar la recompensa de esta misión.");
        return;
      }

      // 🎉 Confetti
      confettiRef.current?.fire("mission");

      // 💰 Actualizar saldo EN MEMORIA (sin recargar todo)
      const baseReward = Number(m.reward_soft_coins || 0);

      if (typeof data.soft_coins === "number") {
        // Si el backend ya regresó el saldo nuevo, lo usamos
        setBalance(data.soft_coins);
      } else if (!Number.isNaN(baseReward)) {
        // Si no viene saldo en la respuesta, sumamos la recompensa esperada
        setBalance((prev) => {
          const current = Number(prev ?? 0);
          return current + baseReward;
        });
      }

      // ✅ Marcar misión como completada localmente
      setMissions((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, done: true } : x))
      );

      // ✅ Mostrar toast de éxito (no banner para no mover layout)
      showToast("¡Recompensa reclamada!");
    } catch (err) {
      console.error("Error al reclamar misión:", err);
      setBanner("No se pudo reclamar la recompensa de esta misión.");
    } finally {
      setClaimingId(null);
    }
  }

  // Factor de reparto actual para previsualizar recompensa (solo referencia)
  const shareFactor =
    crewInfo?.mySharePercent != null
      ? crewInfo.mySharePercent / 100
      : 1;

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
          style={{ marginTop: 18, justifyContent: "space-between", gap: 16 }}
        >
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Usuario:</div>
            <div style={{ fontWeight: 600 }}>
              {user?.email || getCurrentEmail()}
            </div>
          </div>

          <div
            className="row"
            style={{ gap: 12, alignItems: "center", justifyContent: "flex-end" }}
          >
            <div className="store-balance-pill">
              <span>Saldo:</span>
              <strong>{balance ?? user?.soft_coins ?? 0}</strong>
              <span style={{ fontSize: 11 }}>doblones</span>
            </div>

            {crewInfo && (
              <div
                className="store-balance-pill"
                style={{ maxWidth: 260, textAlign: "right" }}
              >
                <div style={{ fontSize: 11, opacity: 0.8 }}>Tripulación</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {crewInfo.name}
                </div>
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  {crewInfo.myRole}
                  {crewInfo.mySharePercent != null && (
                    <>
                      {" · "}
                      <strong>
                        {crewInfo.mySharePercent.toFixed(2)}%
                      </strong>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner solo para mensajes de error / estado problemático */}
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
            {missions.map((m) => {
              const baseReward = Number(m.reward_soft_coins || 0);
              const myEstimatedReward = Math.round(baseReward * shareFactor);

              return (
                <div key={m.id} className={missionCardClass(m.rarity)}>
                  <div className="mission-main">
                    <h3>{m.title}</h3>
                    <p
                      className="muted"
                      style={{ margin: 0, fontSize: 14, maxWidth: 520 }}
                    >
                      {m.description}
                    </p>

                    <div className="mission-meta">
                      <span className={rarityPillClass(m.rarity)}>
                        {rarityLabel(m.rarity)}
                      </span>
                      {m.done && (
                        <span className="mission-status-pill">
                          Completada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mission-reward">
                    <div className="mission-reward-amount">
                      {baseReward}
                    </div>
                    <div className="mission-reward-label">doblones</div>

                    {crewInfo?.mySharePercent != null && (
                      <div
                        className="muted"
                        style={{ fontSize: 11, marginTop: 4, maxWidth: 220 }}
                      >
                        Vista de referencia con tu reparto actual (
                        {crewInfo.mySharePercent.toFixed(2)}%): esto equivaldría
                        aprox. a <strong>{myEstimatedReward}</strong> doblones
                        para ti. La misión en sí solo suma a tu saldo personal.
                      </div>
                    )}

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
              );
            })}
          </div>
        )}
      </div>

      {/* Toast flotante para éxito */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "rgba(15, 118, 110, 0.95)",
            color: "#e0fdfa",
            padding: "10px 16px",
            borderRadius: 8,
            fontSize: 13,
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}

      <ConfettiOverlay ref={confettiRef} />
    </div>
  );
}
