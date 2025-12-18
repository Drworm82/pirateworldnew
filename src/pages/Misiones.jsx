// src/pages/Misiones.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function Misiones() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Misiones</h1>

      {/* Resumen */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <p className="text-sm">
          Misiones activas: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm">
          Misiones completadas: <strong>(placeholder)</strong>
        </p>
      </section>

      {/* Misiones activas */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Misiones activas</h2>

        <div className="text-sm opacity-70">
          No hay misiones activas en este momento.
        </div>

        {/* Ejemplo placeholder */}
        <div className="mt-3 opacity-50 text-sm">
          [Aquí se mostrarán tarjetas de misión con progreso]
        </div>
      </section>

      {/* Misiones completadas */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Misiones completadas</h2>

        <div className="text-sm opacity-70">
          Aún no has completado misiones.
        </div>
      </section>
    </div>
  );
}
