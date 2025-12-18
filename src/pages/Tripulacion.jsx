// src/pages/Tripulacion.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function Tripulacion() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tripulación</h1>

      {/* Resumen de la tripulación */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <p className="text-sm">
          Capitán: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm">
          Tamaño de la tripulación: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm">
          Reparto de botín del capitán: <strong>(placeholder)%</strong>
        </p>
      </section>

      {/* Miembros */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Miembros</h2>

        <ul className="space-y-2 text-sm">
          <li>🧑‍✈️ Capitán — Rol: Capitán (placeholder)</li>
          <li>🏴‍☠️ Pirata — Rol: (placeholder)</li>
          <li>🏴‍☠️ Pirata — Rol: (placeholder)</li>
        </ul>

        <div className="mt-3 opacity-50 text-sm">
          [Aquí se mostrará la lista real de miembros]
        </div>
      </section>

      {/* Bonificaciones */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Bonificaciones de sinergia</h2>

        <p className="text-sm opacity-70">
          No hay bonificaciones activas.
        </p>
      </section>

      {/* Acciones */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Acciones</h2>

        <div className="flex flex-col gap-2 text-sm">
          <button className="border rounded px-2 py-1">
            Invitar pirata (placeholder)
          </button>
          <button className="border rounded px-2 py-1">
            Salir de la tripulación
          </button>
        </div>
      </section>
    </div>
  );
}
