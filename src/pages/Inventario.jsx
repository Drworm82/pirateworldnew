import React from 'react';

export default function Inventario() {
  // Placeholders para datos de backend
  const equipment = {
    sombrero: null, // Backend
    camisa: null, // Backend
    pantalon: null, // Backend
    botas: null, // Backend
    guantes: null, // Backend
    rolItem1: null, // Backend
    rolItem2: null, // Backend
  };
  const doblones = 0; // Backend

  const slots = [
    { id: 'sombrero', name: 'Sombrero' },
    { id: 'camisa', name: 'Camisa' },
    { id: 'pantalon', name: 'Pantalón' },
    { id: 'botas', name: 'Botas' },
    { id: 'guantes', name: 'Guantes' },
  ];

  const rolSlots = [
    { id: 'rolItem1', name: 'Ítem de Rol 1' },
    { id: 'rolItem2', name: 'Ítem de Rol 2' },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventario / Equipamiento</h1>

      {/* Slots de ropa */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Equipamiento</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {slots.map((slot) => (
            <div key={slot.id} className="border border-gray-300 rounded p-4">
              <div className="text-xs text-gray-500 mb-2">{slot.name}</div>
              <div className="h-20 border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center">
                {equipment[slot.id] ? (
                  <span className="text-sm text-gray-700">{equipment[slot.id]}</span>
                ) : (
                  <span className="text-xs text-gray-400">[Vacío]</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slots de rol */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Ítems de Rol</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {rolSlots.map((slot) => (
            <div key={slot.id} className="border border-gray-300 rounded p-4">
              <div className="text-xs text-gray-500 mb-2">{slot.name}</div>
              <div className="h-20 border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center">
                {equipment[slot.id] ? (
                  <span className="text-sm text-gray-700">{equipment[slot.id]}</span>
                ) : (
                  <span className="text-xs text-gray-400">[Vacío]</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doblones */}
      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Doblones</h2>
        <div className="text-2xl font-mono text-gray-800 text-center py-4">
          [Backend: {doblones} doblones]
        </div>
      </div>

      {/* Botón ver rol/sinergias */}
      <button className="w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-700">
        Ver rol / sinergias
      </button>
    </div>
  );
}