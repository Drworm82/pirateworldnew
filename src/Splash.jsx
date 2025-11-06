export default function Splash() {
  return (
    <div style={styles.wrap} aria-label="Cargando">
      <div style={styles.compassWrap}>
        <svg viewBox="0 0 100 100" style={styles.svg} aria-hidden="true">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </radialGradient>
          </defs>

          {/* halo */}
          <circle cx="50" cy="50" r="48" fill="url(#glow)"></circle>

          {/* aro */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="2" />

          {/* N S W E */}
          <g fill="white" fillOpacity="0.85" fontSize="7" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
            <text x="50" y="16">N</text>
            <text x="50" y="84">S</text>
            <text x="16" y="52">W</text>
            <text x="84" y="52">E</text>
          </g>

          {/* aguja */}
          <g>
            <circle cx="50" cy="50" r="2.8" fill="#ffd166" />
            <polygon points="50,12 56,50 50,53 44,50" fill="#0ea5e9">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite" />
            </polygon>
          </g>
        </svg>
      </div>

      <h1 style={styles.h1}>PirateWorld</h1>
      <p style={styles.sub}>Base PWA lista. Edite libremente.</p>
      <div style={styles.progress}>Cargando…</div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#0b132b",
    color: "#fff",
    textAlign: "center",
  },
  compassWrap: {
    width: 140,
    height: 140,
    filter: "drop-shadow(0 6px 18px rgba(0,0,0,.45))",
    marginBottom: 12,
  },
  svg: { width: "100%", height: "100%" },
  h1: { margin: 0, fontSize: "clamp(1.8rem,5.2vw,2.4rem)", letterSpacing: 0.5 },
  sub: { margin: 0, opacity: 0.8 },
  progress: {
    marginTop: 8,
    padding: "8px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
  },
};
