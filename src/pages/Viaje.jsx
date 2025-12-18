// src/pages/Viaje.jsx
export default function Viaje() {
  return (
    <div className="p-4">
      <h1>Viaje en curso</h1>

      <p>Estado del viaje (placeholder)</p>

      <button onClick={() => (window.location.hash = "/ui/gps")}>
        Volver al GPS
      </button>
    </div>
  );
}
