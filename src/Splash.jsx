export default function Splash({ hidden }) {
  return (
    <div
      id="app-splash"
      className={`app-splash${hidden ? " hide" : ""}`}
      aria-hidden={hidden ? "true" : "false"}
    >
      <div className="brand safe">
        <span className="badge">PirateWorld</span>
        <h1>¡Bienvenido a bordo!</h1>
        <div className="dot" />
        <small className="tagline">Preparando el navío…</small>
      </div>
    </div>
  );
}
