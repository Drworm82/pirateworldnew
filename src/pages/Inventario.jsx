// src/pages/Inventario.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function Inventario() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>

      {/* Equipamiento */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Equipamiento</h2>

        <ul className="space-y-2 text-sm">
          <li>🧢 Sombrero: (vacío)</li>
          <li>👕 Camisa: (vacío)</li>
          <li>👖 Pantalón: (vacío)</li>
          <li>🥾 Botas: (vacío)</li>
          <li>🧤 Guantes: (vacío)</li>
        </ul>
      </section>

      {/* Rol / Sinergias */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Rol y sinergias</h2>
        <p className="text-sm opacity-70">
          Rol actual: (placeholder)
        </p>
        <p className="text-sm opacity-70">
          Bonificaciones activas: (placeholder)
        </p>
      </section>

      {/* Ítems */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Objetos</h2>

        <div className="text-sm opacity-70">
          No hay objetos en el inventario.
        </div>
      </section>

      {/* Moneda */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Doblones</h2>
        <p className="text-sm">
          Cantidad: <strong>(placeholder)</strong>
        </p>
      </section>
    </div>
  );
}
