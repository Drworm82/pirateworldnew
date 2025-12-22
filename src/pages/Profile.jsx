// src/pages/Profile.jsx
import React from "react";

/**
 * Worker 11C — Mock Perfil / Reputación
 * UI-only · FSM-first
 * NO backend · NO Supabase · NO lógica real
 */

export default function Profile() {
  // ===============================
  // MOCK DATA (hardcoded, local)
  // ===============================

  const captainTitle = "Capitán del Mar Interior";

  const prestigeBadge = {
    label: "Prestigio Alto",
    tone: "prestige-high", // solo semántico / visual
  };

  const emblem = {
    name: "Bandera del Ajolote",
    symbol: "🏴‍☠️", // placeholder visual simple
  };

  const timeline = [
    {
      id: 1,
      title: "Primer Zarpe",
      description: "El capitán inició su primera travesía.",
    },
    {
      id: 2,
      title: "Puerto Consolidado",
      description: "Estableció relaciones comerciales estables.",
    },
    {
      id: 3,
      title: "Ruta Segura",
      description: "Completó múltiples viajes sin incidentes.",
    },
    {
      id: 4,
      title: "Nombre Reconocido",
      description: "Su reputación comenzó a circular entre puertos.",
    },
  ];

  const socialBadges = [
    { id: "trust", label: "Confiable" },
    { id: "explorer", label: "Explorador" },
    { id: "merchant", label: "Mercader" },
  ];

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="page profile-page">
      {/* Header / Identidad */}
      <section className="profile-header">
        <div className="profile-emblem">
          <div className="emblem-symbol">{emblem.symbol}</div>
          <div className="emblem-name">{emblem.name}</div>
        </div>

        <div className="profile-identity">
          <h1 className="captain-title">{captainTitle}</h1>

          <div className={`prestige-badge ${prestigeBadge.tone}`}>
            {prestigeBadge.label}
          </div>
        </div>
      </section>

      {/* Badges sociales */}
      <section className="profile-badges">
        <h2 className="section-title">Rasgos Sociales</h2>
        <div className="badges-row">
          {socialBadges.map((b) => (
            <span key={b.id} className="social-badge">
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* Timeline narrativa */}
      <section className="profile-timeline">
        <h2 className="section-title">Historia del Capitán</h2>

        <ul className="timeline-list">
          {timeline.map((item) => (
            <li key={item.id} className="timeline-item">
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-description">
                  {item.description}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
