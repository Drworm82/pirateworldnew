export default function Splash({ hidden }) {
  // retrasa la gaviota aleatoriamente para no ser tan “constante”
  const delaySec = Math.floor(Math.random() * 7) + 2; // 2–8s

  return (
    <div
      id="app-splash"
      className={`app-splash${hidden ? " hide" : ""}`}
      aria-hidden={hidden ? "true" : "false"}
    >
      {/* gaviota en SVG, vuela de izq. a der. con flap de alas */}
      <svg
        className="gull"
        style={{ animationDelay: `${delaySec}s, ${delaySec}s` }}
        viewBox="0 0 120 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* cuerpo */}
        <path d="M52 33c4 2 9 2 12 0 2-2 4-4 6-4 3 0 4 3 1 5-5 5-14 7-21 4-2-1-1-4 2-5z" fill="#f1f5f9"/>
        {/* ala izq */}
        <path d="M52 32c-12-8-20-10-32-12 16 0 28 3 37 10l-5 2z" fill="#e2e8f0"/>
        {/* ala der */}
        <path d="M64 32c12-8 20-10 32-12-16 0-28 3-37 10l5 2z" fill="#e2e8f0"/>
        {/* pico/ojito */}
        <circle cx="66" cy="31" r="1.1" fill="#0b132b"/>
        <path d="M69 31l5 1-5 1z" fill="#fbbf24"/>
      </svg>

      {/* bloque de marca */}
      <div className="brand safe">
        <span className="badge">PirateWorld</span>
        <h1>¡Bienvenido a bordo!</h1>
        <small className="tagline">Preparando el navío…</small>
      </div>

      {/* mar animado (dos capas) */}
      <div className="sea" aria-hidden="true">
        <div className="layer back"></div>
        <div className="layer front"></div>
      </div>
    </div>
  );
}
