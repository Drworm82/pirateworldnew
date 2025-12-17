// =======================================================
// Home.jsx — PirateWorld (LIMPIO)
// Entrada principal del demo
// =======================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ensureUser } from "../lib/supaApi";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    ensureUser();
  }, []);

  return (
    <div className="game-content">
      <h1>PirateWorld</h1>

      <button
        onClick={() => navigate("/explore")}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Explorar
      </button>
    </div>
  );
}
