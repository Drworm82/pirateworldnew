// =====================================================
// Splash.jsx — V4 (sin getSessionSafe, estable)
// =====================================================

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supaClient.js";
import { ensureUser } from "../lib/supaApi.js";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      console.log("[SPLASH] Iniciando verificación de sesión...");

      // 1) Ver si ya existe sesión
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        console.log("[SPLASH] No hay sesión, creando anon...");
        await ensureUser("anon");
      } else {
        console.log("[SPLASH] Sesión existente:", session.user.id);
      }

      // 2) Redirigir
      navigate("/home");
    }

    init();
  }, [navigate]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 24,
      }}
    >
      Cargando PirateWorld...
    </div>
  );
}
