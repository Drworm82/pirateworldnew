// =====================================================
// LogViewer.jsx — V3 (Arreglado, import correcto)
// =====================================================

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supaClient.js";   // ✅ FIX PRINCIPAL
import "./LogViewer.css";

export default function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);

      // Obtener sesión actual
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const userId = session?.user?.id;

      console.log("[LOGVIEWER] User:", userId);

      if (!userId) {
        console.error("[LOGVIEWER] No hay sesión activa");
        setLoading(false);
        return;
      }

      // Obtener logs filtrados por usuario
      const { data, error } = await supabase
        .from("client_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("[LOGVIEWER] Error:", error);
        setLoading(false);
        return;
      }

      setLogs(data || []);
      setLoading(false);
    }

    loadLogs();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        Cargando logs...
      </div>
    );
  }

  return (
    <div className="log-viewer-container">
      <h2>Logs del Cliente</h2>

      {logs.length === 0 && <p>No hay logs registrados.</p>}

      <div className="log-list">
        {logs.map((log) => (
          <div key={log.id} className="log-entry">
            <div className="log-meta">
              <span>{new Date(log.created_at).toLocaleString()}</span>
              <span>• {log.level}</span>
            </div>
            <pre>{log.message}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
