export default function Splash({ hide }) {
  return (
    <div className={`app-splash ${hide ? "hide" : ""}`}>
      <div className="brand safe">
        <h1>PirateWorld</h1>
        <div className="dot"></div>
        <small style="opacity:.8">Cargando…</small>
      </div>
    </div>
  );
}
