// TravelStart.jsx — V5 (UUID + JSONB + islands.key + Autonav V4)

import React, { useEffect, useState } from "react";
import {
  getAllIslands,
  getMyShipRow,
  startShipTravelV4
} from "../lib/supaApi.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function TravelStart() {
  const nav = useNavigate();

  const [ship, setShip] = useState(null);
  const [islands, setIslands] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");

  // ======================================================
  // CARGA INICIAL
  // ======================================================
  useEffect(() => {
    (async () => {
      const shipRow = await getMyShipRow();
      setShip(shipRow);

      const isl = await getAllIslands();
      setIslands(isl);
    })();
  }, []);

  if (!ship || islands.length === 0) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        Cargando información...
      </div>
    );
  }

  // ======================================================
  // HANDLER DE VIAJE
  // ======================================================
  async function handleTravel() {
    if (!selectedKey) {
      toast.error("Selecciona un destino.");
      return;
    }

    if (ship.status === "travelling") {
      toast.error("Tu barco ya está viajando.");
      return;
    }

    const res = await startShipTravelV4(selectedKey);
    if (!res || !res.ok) {
      toast.error("No se pudo iniciar el viaje.");
      return;
    }

    toast.success("¡Viaje iniciado!");
    setTimeout(() => nav("/explore"), 500);
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Seleccionar Destino</h2>

      {/* Información del barco */}
      <div style={{ marginBottom: 20 }}>
        <div><b>Tipo:</b> {ship.type}</div>
        <div><b>HP:</b> {ship.hp}</div>
        {ship.origin && (
          <div>
            <b>Origen:</b> {ship.origin.name ?? "???"}
          </div>
        )}
      </div>

      {/* Lista de islas */}
      <div style={{ marginBottom: 20 }}>
        <label><b>Destino:</b></label>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          style={{
            display: "block",
            marginTop: 8,
            padding: 8,
            borderRadius: 6,
            width: "100%",
            background: "#222",
            color: "white",
            border: "1px solid #4da3ff",
          }}
        >
          <option value="">-- Selecciona una isla --</option>
          {islands.map((isl) => (
            <option key={isl.key} value={isl.key}>
              {isl.name} ({isl.region})
            </option>
          ))}
        </select>
      </div>

      {/* Botón de viaje */}
      <button
        onClick={handleTravel}
        style={{
          padding: "10px 18px",
          background: "#4da3ff",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
          marginTop: 10,
        }}
      >
        Iniciar Viaje
      </button>

      {/* Mostrar destino actual si existe */}
      {ship.destination && (
        <div style={{ marginTop: 30 }}>
          <b>Destino actual:</b> {ship.destination.name}
        </div>
      )}
    </div>
  );
}
