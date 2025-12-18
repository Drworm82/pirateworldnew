// src/pages/MapaMundo.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function MapaMundo() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa del Mundo</h1>

      {/* Controles */}
      <section className="mb-4 border border-dashed border-gray-600 p-3 rounded">
        <h2 className="text-lg font-semibold mb-2">Capas</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button className="border rounded px-2 py-1">Descubierto</button>
          <button className="border rounded px-2 py-1">No descubierto</button>
          <button className="border rounded px-2 py-1">Mapas falsos</button>
          <button className="border rounded px-2 py-1">Mapas oficiales</button>
        </div>
      </section>

      {/* Mapa placeholder */}
      <section className="mb-4 border border-dashed border-gray-600 p-4 rounded">
        <div
          className="flex items-center justify-center text-sm opacity-70"
          style={{ height: 280 }}
        >
          Mapa del mundo (placeholder)
        </div>
      </section>

      {/* Progreso */}
      <section className="mb-4 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Progreso de exploración</h2>
        <p className="text-sm">
          Ecúmene descubierta: <strong>(placeholder)%</strong>
        </p>
      </section>

      {/* Mapas del jugador */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Mapas en posesión</h2>
        <p className="text-sm opacity-70">
          No posees mapas actualmente.
        </p>
        <div className="mt-2 opacity-50 text-sm">
          [Aquí se listarán los mapas obtenidos]
        </div>
      </section>
    </div>
  );
}
