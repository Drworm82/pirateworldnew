// =======================================================
// Zarpar.jsx — PirateWorld
// Selección de misión + inicio de viaje (CORE LOOP)
// =======================================================

import { useState } from "react";
import { shipTravelStartV5 } from "../lib/supaApi";
import { MISSIONS } from "../data/missions";

const MISSION_KEY = "pw_active_mission";
const MISSION_INDEX_KEY = "pw_mission_index";

export default function Zarpar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const missionIndex =
    Number(localStorage.getItem(MISSION_INDEX_KEY)) || 1;

  const availableMissions = [];

  if (missionIndex >= 1) availableMissions.push(MISSIONS.M1);
  if (missionIndex >= 2) availableMissions.push(MISSIONS.M2);
  if (missionIndex >= 3) availableMissions.push(MISSIONS.M3);

  async function startMission(mission) {
    try {
      setLoading(true);
      setError(null);

      // Guardar misión activa
      localStorage.setItem(
  "pw_active_mission",
  JSON.stringify({
    key: mission.key,        // M1 | M2 | M3
    reward: mission.reward,  // 150 | 200 | 300
    risk: mission.risk       // low | medium | high
  })
);


      // Iniciar viaje (backend / mock)
      await shipTravelStartV5(
        mission.origin,
        mission.destination
      );

      // Ir a viaje
      window.location.hash = "#/ui/viaje";
    } catch (e) {
      console.error("Error al zarpar:", e);
      setError("No se pudo zarpar.");
      alert("No se pudo zarpar. Revisa consola.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page zarpar">
      <h1>Zarpar</h1>

      {availableMissions.map((m) => (
        <div key={m.id} className="card mission">
          <h3>{m.title}</h3>
          <p>{m.description}</p>
          <p>
            Ruta: {m.origin} → {m.destination}
          </p>
          <p>Recompensa: +{m.reward} doblones</p>

          {m.risk === "high" && (
            <p>
              <strong>Riesgo alto</strong>
            </p>
          )}

          <button
            disabled={loading}
            onClick={() => startMission(m)}
          >
            Zarpar
          </button>
        </div>
      ))}

      {loading && <p>Zarpando…</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
