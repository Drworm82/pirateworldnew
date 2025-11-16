// src/pages/Explore.jsx
import React, { useEffect, useState } from "react";
import {
  getLastUserId,
  getUserState,
  startExploration,
  getActiveExploration,
  resolveExploration,
} from "../lib/supaApi.js";
import Toast from "../components/Toast.jsx";

// Formatea hora hh:mm
function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Minutos restantes hasta ETA
function minutesRemaining(etaIso) {
  if (!etaIso) return null;
  const now = Date.now();
  const eta = new Date(etaIso).getTime();
  const diffMs = eta - now;
  return Math.ceil(diffMs / 60000);
}

export default function ExplorePage() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");

  // En tu modelo solo hay una run activa, pero la tratamos como lista de 0–1
  const [run, setRun] = useState(null);
  const [runLoading, setRunLoading] = useState(false);

  const [duration, setDuration] = useState(30); // minutos
  const [toast, setToast] = useState(null);

  // autocierra el toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  // carga usuario + exploración activa
  useEffect(() => {
    (async () => {
      try {
        const last = getLastUserId();
        if (!last) {
          setUserError(
            "No hay usuario activo. Ve a 'Usuario demo' para crear / cargar uno."
          );
          setUserLoading(false);
          return;
        }

        const u = await getUserState({ userId: last });
        setUser(u);
        setUserLoading(false);

        setRunLoading(true);
        const r = await getActiveExploration(u.id);
        if (r && r.ok && r.status) {
          setRun(r);
        } else {
          setRun(null);
        }
      } catch (err) {
        console.error("Error al cargar exploración:", err);
        setUserError(err.message || "Error al cargar exploración");
      } finally {
        setRunLoading(false);
      }
    })();
  }, []);

  async function handleRefresh() {
    if (!user) return;
    setRunLoading(true);
    try {
      const r = await getActiveExploration(user.id);
      if (r && r.ok && r.status) {
        setRun(r);
      } else {
        setRun(null);
      }
    } catch (err) {
      console.error("refresh exploration error:", err);
      setToast({
        type: "error",
        message: err.message || "Error al refrescar exploración.",
      });
    } finally {
      setRunLoading(false);
    }
  }

  async function handleStart() {
    if (!user) return;
    setRunLoading(true);
    try {
      const r = await startExploration({
        userId: user.id,
        durationMin: duration,
      });

      if (!r || !r.ok) {
        if (r?.error === "run_already_in_progress") {
          setToast({
            type: "error",
            message: "Ya tienes una exploración en curso.",
          });
        } else {
          throw new Error(r?.error || "No se pudo iniciar la exploración.");
        }
        return;
      }

      setRun(r);
      setUser((prev) =>
        prev ? { ...prev, soft_coins: r.soft_coins ?? prev.soft_coins } : prev
      );
      setToast({
        type: "success",
        message: `Exploración iniciada. Llega aprox. a las ${fmtTime(
          r.eta_at
        )}.`,
      });
    } catch (err) {
      console.error("start exploration error:", err);
      setToast({
        type: "error",
        message: err.message || "Error al iniciar exploración.",
      });
    } finally {
      setRunLoading(false);
    }
  }

  // 🔥 Ahora recibe el run a resolver (para lista)
  async function handleResolve(targetRun) {
    const current = targetRun || run;
    if (!user || !current) return;

    setRunLoading(true);
    try {
      const r = await resolveExploration({
        userId: user.id,
        runId: current.run_id || current.id,
        depositTo: "wallet",
      });

      if (!r || !r.ok) {
        throw new Error(r?.error || "No se pudo resolver la exploración.");
      }

      // sumamos saldo
      setUser((prev) =>
        prev ? { ...prev, soft_coins: r.soft_coins ?? prev.soft_coins } : prev
      );

      const coins = r.coins ?? r.loot_json?.coins ?? 0;
      setToast({
        type: "success",
        message: `Exploración resuelta: +${coins} doblones.`,
      });

      // Como el panel es de "activas", limpiamos la run
      setRun(null);
    } catch (err) {
      console.error("resolve exploration error:", err);
      setToast({
        type: "error",
        message: err.message || "Error al resolver exploración.",
      });
    } finally {
      setRunLoading(false);
    }
  }

  // Lo convertimos en lista para FE-22 (aunque solo haya una)
  const runs = run ? [run] : [];
  const loadingAny = runLoading || userLoading;

  return (
    <div className="page-container">
      {/* Toast flotante */}
      <Toast
        message={toast?.message}
        type={toast?.type || "success"}
        onClose={() => setToast(null)}
      />

      <h1>Exploración</h1>

      {userError && (
        <div className="card" style={{ borderColor: "#b91c1c" }}>
          <div style={{ color: "#fecaca", fontSize: 14 }}>{userError}</div>
        </div>
      )}

      {user && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="muted" style={{ fontSize: 13 }}>
                Jugador
              </div>
              <strong>{user.email}</strong>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Saldo actual
              </div>
              <strong>{user.soft_coins} doblones</strong>
            </div>
          </div>
        </div>
      )}

      {/* Lanzar nueva exploración */}
      <div className="card">
        <h3>Iniciar nueva exploración</h3>
        <p className="muted">
          Solo puede haber <strong>una expedición activa</strong> por jugador.
        </p>

        <div className="row" style={{ marginTop: 8, marginBottom: 8 }}>
          <label style={{ fontSize: 14 }}>
            Duración:
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                marginLeft: 8,
                background: "#020617",
                color: "#e5e7eb",
                borderRadius: 8,
                border: "1px solid #1d4ed8",
                padding: "6px 10px",
              }}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={
            !user || runLoading || (run && run.status === "in_progress")
          }
        >
          {run && run.status === "in_progress"
            ? "Ya hay una exploración en curso"
            : "Iniciar exploración"}
        </button>
      </div>

      {/* 🔥 FE-22: Panel de exploraciones activas en forma de lista */}
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Exploraciones activas</h3>
          <button
            type="button"
            className="btn ghost"
            onClick={handleRefresh}
            disabled={runLoading || !user}
          >
            Refrescar
          </button>
        </div>

        {loadingAny && runs.length === 0 && (
          <div className="muted" style={{ marginTop: 8 }}>
            Cargando exploraciones...
          </div>
        )}

        {!loadingAny && runs.length === 0 && (
          <div className="muted" style={{ marginTop: 8 }}>
            No tienes exploraciones activas.
          </div>
        )}

        {!loadingAny && runs.length > 0 && (
          <div className="explore-runs-list">
            {runs.map((r) => {
              const remaining = minutesRemaining(r.eta_at);
              const canResolve =
                r.status === "in_progress" && remaining != null && remaining <= 0;

              return (
                <div key={r.run_id || r.id} className="explore-run-row">
                  <div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      Barco
                    </div>
                    <strong>{r.ship_name}</strong>

                    <div
                      className="muted"
                      style={{ fontSize: 12, marginTop: 4 }}
                    >
                      Estado: <strong>{r.status}</strong>
                    </div>

                    {r.status === "in_progress" && remaining != null && (
                      <div
                        className="muted"
                        style={{ fontSize: 12, marginTop: 2 }}
                      >
                        Tiempo restante:{" "}
                        <strong>
                          {remaining > 0
                            ? `${remaining} min`
                            : "listo para resolver"}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12 }} className="muted">
                      Inicio
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>
                      <strong>{fmtTime(r.started_at)}</strong>
                    </div>

                    <div style={{ fontSize: 12 }} className="muted">
                      Llega aprox.
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 8 }}>
                      <strong>{fmtTime(r.eta_at)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResolve(r)}
                      disabled={!canResolve || runLoading}
                    >
                      Resolver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
