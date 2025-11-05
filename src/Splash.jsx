export default function Splash({ hidden }) {
  return (
    <div
      id="app-splash"
      className={`app-splash${hidden ? " hide" : ""}`}
      aria-hidden={hidden ? "true" : "false"}
    >
      <div className="brand safe">
        <h1>PirateWorld</h1>
        <div className="dot" />
        <small style={{ opacity: 0.8 }}>Cargando…</small>
      </div>
    </div>
  );
}
