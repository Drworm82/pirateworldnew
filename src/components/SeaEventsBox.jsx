// src/components/SeaEventsBox.jsx
import React, { useEffect, useState } from "react";
import SeaEventCard from "./SeaEventCard.jsx";
import eventsDict from "../config/eventsDict.js";

/**
 * HUD emergente: muestra UN evento a la vez.
 * Ahora incluye sonidos según el tipo de evento.
 */

export default function SeaEventsBox({ event }) {
  const [visibleEvent, setVisibleEvent] = useState(null);
  const [fadeClass, setFadeClass] = useState("fadeIn");

  // Cargar sonido según tipo de evento
  function playEventSound(type) {
    const filename = {
      storm: "event_storm.mp3",
      wind: "event_wind.mp3",
      loot: "event_loot.mp3",
      pirates: "event_pirates.mp3",
      whale: "event_whale.mp3",
      current: "event_current.mp3",
      default: "event_default.mp3",
    }[type] || "event_default.mp3";

    const audioPath = `/src/assets/sfx/${filename}`;

    const sfx = new Audio(audioPath);
    sfx.volume = 0.55; // volumen recomendado
    sfx.play().catch((err) => {
      console.warn("Audio playback blocked:", err);
    });
  }

  // Mostrar evento
  useEffect(() => {
    if (!event) return;

    // Mostrar en pantalla
    setVisibleEvent(event);
    setFadeClass("fadeIn");

    // Reproducir sonido
    playEventSound(event.type);

    // Auto fade-out después de 4.5s
    const timer = setTimeout(() => setFadeClass("fadeOut"), 4500);

    // Remover después del fade-out
    const removeTimer = setTimeout(() => setVisibleEvent(null), 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [event]);

  if (!visibleEvent) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        transition: "opacity 0.4s ease",
      }}
      className={fadeClass}
    >
      <SeaEventCard event={visibleEvent} />
    </div>
  );
}
