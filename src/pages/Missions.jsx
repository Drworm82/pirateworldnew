// src/pages/Missions.jsx
import React, { useEffect, useState } from "react";
import {
  getLastUserId,
  listDailyMissions,
} from "../lib/supaApi.js";

const RARITY_LABELS = {
  common: "Común",
  rare: "Rara",
  epic: "Épica",
  legendary: "Legendaria",
};

const RARITY_CLASS = {
  common: "store-rarity-common",
  rare: "store-rarity-rare",
  epic: "store-rarity-epic",
  legendary: "store-rarity-legendary",
};

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const userId = getLastUserId();

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const rows = await listDailyMissions();
        if (!alive) return;
        setMissions(rows);
      } catch (err) {
        console.error("Error listDailyMissions:", err);
        if (!alive) return;
        setErrorMsg(err?.message || "No se pudieron cargar las misiones.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="missions-page">
      <div className="card missions-header">
        <h2>Misiones diarias</h2>
        <p className="muted">
          Completa misiones para ganar doblones extra y avanzar en PirateWorld.
        </p>
        {userId && (
          <p className="missions-user muted">
            Usuario actual:{" "}
            <code className="ledger-user-id">{userId}</code>
          </p>
        )}
      </div>

      {loading && (
        <div className="card">
          <p className="muted">Cargando misiones...</p>
        </div>
      )}

      {errorMsg && !loading && (
        <div className="card">
          <p style={{ color: "#fecaca" }}>
            Error al cargar misiones: {errorMsg}
          </p>
        </div>
      )}

      {!loading && !errorMsg && missions.length === 0 && (
        <div className="card">
          <p className="muted">
            Hoy no hay misiones diarias configuradas.
          </p>
        </div>
      )}

      {!loading && !errorMsg && missions.length > 0 && (
        <div className="missions-list">
          {missions.map((m) => (
            <article
              key={m.code}
              className="card mission-card"
            >
              <div className="mission-main">
                <h3>{m.title}</h3>
                <div className="row" style={{ marginTop: 4 }}>
                  <span
                    className={
                      "store-rarity-pill " +
                      (RARITY_CLASS[m.rarity] || "store-rarity-common")
                    }
                  >
                    {RARITY_LABELS[m.rarity] || m.rarity || "Común"}
                  </span>
                  <span className="mission-code muted">
                    Código: <code>{m.code}</code>
                  </span>
                </div>
              </div>

              <div className="mission-reward">
                <div className="mission-reward-amount">
                  +{m.reward_soft_coins ?? 0}
                </div>
                <div className="mission-reward-label">
                  doblones
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Missions;
