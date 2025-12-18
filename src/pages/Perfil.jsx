// src/pages/Perfil.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function Perfil() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil del Capitán</h1>

      {/* Datos básicos */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <p className="text-sm">
          Nombre: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm">
          Nivel: <strong>(placeholder)</strong>
        </p>
        <p className="text-sm">
          Reputación: <strong>(placeholder)</strong>
        </p>
      </section>

      {/* Barcos */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Barcos</h2>
        <ul className="text-sm space-y-1">
          <li>⛵ Barco principal: (placeholder)</li>
          <li>🚢 Barcos adicionales: (placeholder)</li>
        </ul>
      </section>

      {/* Estadísticas */}
      <section className="mb-6 border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Estadísticas</h2>
        <ul className="text-sm space-y-1">
          <li>Viajes completados: (placeholder)</li>
          <li>Islas descubiertas: (placeholder)</li>
          <li>Doblones ganados: (placeholder)</li>
        </ul>
      </section>

      {/* Acciones */}
      <section className="border border-dashed border-gray-600 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Acciones</h2>
        <div className="flex flex-col gap-2 text-sm">
          <button className="border rounded px-2 py-1">
            Editar perfil (placeholder)
          </button>
          <button className="border rounded px-2 py-1">
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}
