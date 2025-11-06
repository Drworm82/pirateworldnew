export default function Splash({ hidden = false }) {
  return (
    <div className={`app-splash ${hidden ? "hide" : ""}`} aria-hidden={hidden}>
      {/* Brújula giratoria */}
      <svg
        className="splash-compass"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="compassGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <!-- halo suave -->
        <circle cx="50" cy="50" r="48" fill="url(#compassGlow)"></circle>
        <!-- aro exterior -->
        <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <!-- marcas cardinales -->
        <g fill="#ffffff" opacity="0.9" fontFamily="system-ui, sans-serif" fontSize="9" textAnchor="middle">
          <text x="50" y="13">N</text>
          <text x="50" y="96">S</text>
          <text x="7"  y="54">W</text>
          <text x="93" y="54">E</text>
        </g>
        <!-- rosa de los vientos -->
        <g>
          <polygon points="50,6 54,50 50,94 46,50" fill="#ffffff"/>
          <polygon points="50,14 57,50 50,86 43,50" fill="#0b132b"/>
        </g>
        <!-- centro -->
        <circle cx="50" cy="50" r="3.6" fill="#fbbf24" />
      </svg>

      {/* Caja de marca */}
      <div className="brand">
        <h1>PirateWorld</h1>
        <p className="tagline">Base PWA lista. Edite libremente.</p>
        <div className="badge">Cargando…</div>
      </div>
    </div>
  );
}
