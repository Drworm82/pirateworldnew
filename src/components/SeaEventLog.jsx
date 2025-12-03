// ======================================================================
// SeaEventLog.jsx — Histórico PRO FINAL
// ======================================================================

import React, { useEffect, useRef } from "react";
import "./SeaEventLog.css";

export default function SeaEventLog({ events }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="sev-log-container">
      <h3 className="sev-log-title">📜 Registro de eventos</h3>

      <div className="sev-log-list" ref={ref}>
        {events.map((e) => (
          <div
            key={e.id}
            className={`sev-log-item sev-${e.type || "default"} ${
              e.expired ? "sev-expired" : ""
            }`}
          >
            <div className="sev-log-header">
              <span className="sev-log-time">{e.time}</span>
              <span className="sev-log-title2">{e.title}</span>
            </div>
            <div className="sev-log-desc">{e.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
