// src/pages/ChatLocal.jsx
// UI ONLY — Base44 Skeleton
// No backend. No lógica real.
// PirateWorld UI Contract.

export default function ChatLocal() {
  return (
    <div className="p-4 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Chat Local</h1>

      {/* Contexto */}
      <section className="mb-3 border border-dashed border-gray-600 p-3 rounded">
        <p className="text-sm">
          Canal: <strong>(ciudad / isla actual)</strong>
        </p>
        <p className="text-sm opacity-70">
          Chat por proximidad (placeholder)
        </p>
      </section>

      {/* Mensajes */}
      <section className="flex-1 mb-3 border border-dashed border-gray-600 p-3 rounded overflow-auto">
        <div className="space-y-2 text-sm opacity-70">
          <p>[Mensaje de otro jugador]</p>
          <p>[Mensaje del sistema]</p>
          <p>[Mensaje del jugador]</p>
        </div>

        <div className="mt-3 opacity-50 text-sm">
          [Aquí aparecerán los mensajes en tiempo real]
        </div>
      </section>

      {/* Input */}
      <section className="border border-dashed border-gray-600 p-3 rounded">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje…"
            className="flex-1 border rounded px-2 py-1 bg-transparent"
            disabled
          />
          <button className="border rounded px-3 py-1" disabled>
            Enviar
          </button>
        </div>
        <p className="mt-2 text-xs opacity-60">
          El envío se habilitará cuando el backend esté conectado.
        </p>
      </section>
    </div>
  );
}
