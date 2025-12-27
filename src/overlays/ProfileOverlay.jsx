import "./ProfileOverlay.css";
import { useEffect, useState } from "react";
import { getPlayerSummary } from "../data";

export default function ProfileOverlay() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let mounted = true;

    getPlayerSummary().then((data) => {
      if (mounted) setPlayer(data);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!player) {
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          <h2>Perfil</h2>
          <p>Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <h2>Perfil</h2>

        <div className="profile-row">
          <span className="label">Rango</span>
          <span className="value">{player.rank}</span>
        </div>

        <div className="profile-row">
          <span className="label">Título</span>
          <span className="value">{player.title}</span>
        </div>

        <div className="profile-row">
          <span className="label">Reputación</span>
          <span className="value">{player.reputation_score}</span>
        </div>

        <div className="profile-row">
          <span className="label">Tripulación</span>
          <span className="value">{player.crew_count}</span>
        </div>

        <div className="profile-row">
          <span className="label">Islas</span>
          <span className="value">{player.islands_count}</span>
        </div>

        <div className="profile-row">
          <span className="label">Viajes</span>
          <span className="value">{player.travel_count}</span>
        </div>

        <p className="profile-hint">
          Datos reales (RO) · fallback a mock
        </p>
      </div>
    </div>
  );
}
