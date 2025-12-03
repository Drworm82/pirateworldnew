// src/config/eventsDict.js

/**
 * Diccionario central de eventos del mar.
 *
 * Cada tipo de evento define:
 *  - icon: emoji
 *  - title: título corto
 *  - message: descripción narrativa
 *  - color: opcional para estilos futuros
 */

const eventsDict = {
  storm: {
    icon: "⛈️",
    title: "Tormenta",
    message: "Una tormenta azota el barco con fuertes vientos y lluvia.",
    color: "#4da3ff",
  },

  wind: {
    icon: "💨",
    title: "Viento fuerte",
    message: "Rachas de viento empujan al barco y alteran la velocidad.",
    color: "#9cd2ff",
  },

  loot: {
    icon: "🪙",
    title: "Cofre flotante",
    message: "El vigía detecta un cofre flotando cerca del barco.",
    color: "#ffd93b",
  },

  pirates: {
    icon: "🏴‍☠️",
    title: "Piratas",
    message: "Piratas avistan tu barco y se preparan para atacar.",
    color: "#ff4d4d",
  },

  whale: {
    icon: "🐋",
    title: "Ballena",
    message: "Una enorme ballena emerge cerca del barco.",
    color: "#66ccff",
  },

  current: {
    icon: "🌊",
    title: "Corriente marina",
    message: "Una fuerte corriente modifica tu rumbo.",
    color: "#4da3ff",
  },

  default: {
    icon: "🌟",
    title: "Evento",
    message: "Algo inesperado ocurre en el mar.",
    color: "#ffffff",
  },
};

export default eventsDict;
